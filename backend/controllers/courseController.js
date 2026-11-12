import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, nextSequentialId } from "../utils/helpers.js";
import { emitEvent } from "../services/socketService.js";

function enrichCourse(c) {
    const out = { ...c };

    // Resolve fee across all possible legacy/current field names: fees, fee, courseFee, price, amount, totalFee
    let rawFee = undefined;
    const candidates = [out.fees, out.fee, out.courseFee, out.price, out.amount, out.totalFee];
    for (const val of candidates) {
        if (val !== undefined && val !== null && String(val).trim() !== "" && String(val).trim() !== "Not Available") {
            rawFee = val;
            break;
        }
    }

    let feeFormatted = "Not Available";
    let feeNumber = null;

    if (rawFee !== undefined && rawFee !== null && String(rawFee).trim() !== "") {
        const num = Number(String(rawFee).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(num)) {
            feeNumber = num;
            feeFormatted = `₹${num.toLocaleString("en-IN")}`;
        } else {
            feeFormatted = String(rawFee).startsWith("₹") ? String(rawFee) : `₹${rawFee}`;
        }
    }

    out.description = (out.description || "").trim() || "Not Available";
    out.duration = (out.duration || "").trim() || "Not Available";
    out.status = (out.status || "").trim() || "Not Available";

    const resolvedFee = feeNumber !== null ? feeNumber : (rawFee !== undefined ? rawFee : "Not Available");
    out.fees = resolvedFee;
    out.fee = resolvedFee;
    out.courseFee = resolvedFee;
    out.feeFormatted = feeFormatted;

    return out;
}

export async function getCourses(req, res) {
    const db = getDB();
    const courses = await db.collection("courses").find({}).toArray();
    res.status(200).json(courses.map(enrichCourse));
}

export async function getCourseById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Course Id" });
    const db = getDB();
    const course = await db.collection("courses").findOne({ _id: new ObjectId(id) });
    if (!course) return res.status(404).json({ success: false, message: "Course Not Found" });
    res.status(200).json(enrichCourse(course));
}

export async function addCourse(req, res) {
    const db = getDB();
    const course = { ...(req.body || {}) };

    if (!course.courseName || String(course.courseName).trim() === "") {
        return res.status(400).json({ success: false, message: "Course Name is required." });
    }

    // Extract fee from fees, fee, or courseFee
    const rawFee = course.fees !== undefined ? course.fees : (course.fee !== undefined ? course.fee : course.courseFee);
    if (rawFee !== undefined && rawFee !== null && String(rawFee).trim() !== "" && String(rawFee).trim() !== "Not Available") {
        const num = Number(String(rawFee).replace(/[^0-9.-]+/g, ""));
        const val = !isNaN(num) ? num : rawFee;
        course.fees = val;
        course.fee = val;
        course.courseFee = val;
    }

    const generatedId = await nextSequentialId(db, "courses", "courseCode", "CRS");
    course.courseCode = generatedId;
    course.courseId = generatedId;
    course.createdAt = new Date().toISOString();
    course.updatedAt = new Date().toISOString();

    const result = await db.collection("courses").insertOne(course);

    emitEvent("course:created", {
        courseCode: generatedId,
        courseName: course.courseName,
    });

    res.status(201).json({ success: true, message: "Course Added Successfully", insertedId: result.insertedId, courseCode: generatedId });
}

export async function updateCourse(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Course Id" });
    const db = getDB();
    const course = { ...req.body };
    delete course._id;
    delete course.courseCode;
    delete course.courseId;
    delete course.feeFormatted;

    // Extract fee from fees, fee, or courseFee
    const rawFee = course.fees !== undefined ? course.fees : (course.fee !== undefined ? course.fee : course.courseFee);
    if (rawFee !== undefined && rawFee !== null && String(rawFee).trim() !== "" && String(rawFee).trim() !== "Not Available") {
        const num = Number(String(rawFee).replace(/[^0-9.-]+/g, ""));
        const val = !isNaN(num) ? num : rawFee;
        course.fees = val;
        course.fee = val;
        course.courseFee = val;
    }

    course.updatedAt = new Date().toISOString();

    const result = await db.collection("courses").updateOne({ _id: new ObjectId(id) }, { $set: course });
    if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Course Not Found" });

    emitEvent("course:updated", {
        id,
        courseName: course.courseName
    });

    res.status(200).json({ success: true, message: "Course Updated Successfully" });
}

export async function deleteCourse(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Course Id" });
    const db = getDB();
    const result = await db.collection("courses").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Course Not Found" });

    emitEvent("course:deleted", { id });

    res.status(200).json({ success: true, message: "Course Deleted Successfully" });
}
