import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import {
    isValidObjectId,
    formatDateDDMMYYYY,
    resolveReference,
    nextSequentialId
} from "../utils/helpers.js";
import { createNotification } from "./notificationController.js";
import { emitEvent } from "../services/socketService.js";

async function enrichStudent(db, student, cache = {}) {
    const out = { ...student };

    let courseName = (out.courseName || out.course || "").trim();
    if ((!courseName || courseName === "Not Available") && out.courseId) {
        const key = `course_${out.courseId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "courses", out.courseId, "courseId");
        const c = cache[key];
        if (c) courseName = c.courseName || c.name;
    }
    out.courseName = courseName && courseName !== "Not Available" ? courseName : "Not Available";
    out.course = out.courseName;

    let batchName = (out.batchName || out.batch || "").trim();
    if ((!batchName || batchName === "Not Available") && out.batchId) {
        const key = `batch_${out.batchId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "batches", out.batchId, "batchId");
        const b = cache[key];
        if (b) batchName = b.batchName || b.name;
    }
    out.batchName = batchName && batchName !== "Not Available" ? batchName : "Not Available";
    out.batch = out.batchName;

    out.joiningDateFormatted = formatDateDDMMYYYY(out.joiningDate || out.createdAt);
    out.dobFormatted = formatDateDDMMYYYY(out.dob || out.dateOfBirth);

    out.mobile = out.mobile !== undefined && out.mobile !== null && String(out.mobile).trim() !== ""
        ? String(out.mobile).trim()
        : "Not Available";

    out.gender = out.gender !== undefined && out.gender !== null && String(out.gender).trim() !== ""
        ? String(out.gender).trim()
        : "Not Available";

    out.status = out.status !== undefined && out.status !== null && String(out.status).trim() !== ""
        ? String(out.status).trim()
        : "Active";

    out.address = out.address !== undefined && out.address !== null && String(out.address).trim() !== ""
        ? String(out.address).trim()
        : "Not Available";

    out.profilePhoto = out.profilePhoto || out.photo || "";
    out.photo = out.profilePhoto || out.photo || "";

    return out;
}

export async function getStudents(req, res) {
    const db = getDB();
    const students = await db.collection("students").find({}).toArray();

    const cache = {};
    const enriched = [];
    for (const student of students) {
        enriched.push(await enrichStudent(db, student, cache));
    }

    res.status(200).json(enriched);
}

export async function getStudentById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Student Id" });
    }

    const db = getDB();
    const student = await db.collection("students").findOne({ _id: new ObjectId(id) });
    if (!student) {
        return res.status(404).json({ success: false, message: "Student Not Found" });
    }

    res.status(200).json(await enrichStudent(db, student));
}

// GET /students/profile — resolves the logged-in student's own profile.
// Matching priority: referenceId → studentId → email.
export async function getStudentProfile(req, res) {
    const db = getDB();
    const referenceId = (req.query.referenceId || "").trim();
    const studentId = (req.query.studentId || "").trim();
    const email = (req.query.email || "").trim().toLowerCase();

    if (!referenceId && !studentId && !email) {
        return res.status(400).json({ success: false, message: "referenceId, studentId or email is required" });
    }

    let student = null;
    const idToMatch = referenceId || studentId;

    if (idToMatch) {
        student = await db.collection("students").findOne({
            studentId: { $regex: new RegExp(`^${idToMatch}$`, "i") }
        });
    }

    if (!student && email) {
        student = await db.collection("students").findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") }
        });
    }

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "No student profile found. Please ask the Admin to create your profile."
        });
    }

    res.status(200).json(await enrichStudent(db, student));
}

export async function addStudent(req, res) {
    const db = getDB();
    const student = req.body || {};

    if (!student.firstName || !student.lastName) {
        return res.status(400).json({ success: false, message: "First name and last name are required." });
    }

    const generatedId = await nextSequentialId(db, "students", "studentId", "EDU");
    student.studentId = generatedId;
    student.createdAt = new Date().toISOString();
    student.updatedAt = new Date().toISOString();

    const result = await db.collection("students").insertOne(student);

    // ── Also create a login account so the student can actually sign in ──
    let loginCreated = false;
    let tempPassword = null;
    const email = (student.email || "").trim().toLowerCase();

    if (email) {
        const existingUser = await db.collection("users").findOne({ email });
        if (!existingUser) {
            tempPassword = /^\d{10}$/.test(String(student.mobile || "")) ? String(student.mobile) : `${generatedId}@123`;
            await db.collection("users").insertOne({
                userId: `USR${Date.now().toString().slice(-6)}`,
                firstName: student.firstName,
                lastName: student.lastName,
                mobile: student.mobile || "",
                email,
                gender: student.gender || "",
                password: hashPassword(tempPassword),
                role: "student",
                referenceId: generatedId,
                status: student.status || "Active",
                profilePhoto: student.profilePhoto || student.photo || "",
                photo: student.profilePhoto || student.photo || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            loginCreated = true;
        }
    }

    // Background notification for Admin and Teachers
    createNotification(db, {
        recipientRole: "admin",
        title: "New Student Enrolled",
        message: `${student.firstName} ${student.lastName} (${generatedId}) has been added.`,
        type: "success",
        link: "/students",
        relatedId: generatedId
    }).catch(err => console.error("Notification hook error:", err));

    emitEvent("student:created", {
        studentId: generatedId,
        firstName: student.firstName,
        lastName: student.lastName,
        courseId: student.courseId,
        batchId: student.batchId,
    });

    res.status(201).json({
        success: true,
        message: "Student Added Successfully",
        insertedId: result.insertedId,
        studentId: generatedId,
        loginCreated,
        tempPassword: loginCreated ? tempPassword : undefined,
        loginNote: !email
            ? "No email was provided, so no login account was created for this student."
            : (loginCreated
                ? `A login account was created. Share these credentials with the student: ${email} / ${tempPassword}`
                : "An account with this email already exists — it was left unchanged.")
    });
}

export async function updateStudent(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Student Id" });
    }

    const db = getDB();
    const student = { ...req.body };
    delete student._id;
    delete student.studentId; // Never allow the unique studentId to be overwritten
    student.updatedAt = new Date().toISOString();

    const existing = await db.collection("students").findOne({ _id: new ObjectId(id) });
    if (!existing) {
        return res.status(404).json({ success: false, message: "Student Not Found" });
    }

    await db.collection("students").updateOne({ _id: new ObjectId(id) }, { $set: student });

    // Keep the linked login account's display info / status in sync
    if (existing.studentId) {
        const userUpdate = {};
        if (student.firstName) userUpdate.firstName = student.firstName;
        if (student.lastName) userUpdate.lastName = student.lastName;
        if (student.status) userUpdate.status = student.status;
        if (student.profilePhoto || student.photo) {
            userUpdate.profilePhoto = student.profilePhoto || student.photo;
            userUpdate.photo = student.profilePhoto || student.photo;
        }
        if (Object.keys(userUpdate).length > 0) {
            await db.collection("users").updateOne(
                { referenceId: existing.studentId, role: "student" },
                { $set: userUpdate }
            );
        }
    }

    emitEvent("student:updated", {
        studentId: existing.studentId,
        id,
        courseId: student.courseId || existing.courseId,
        batchId: student.batchId || existing.batchId
    });

    res.status(200).json({ success: true, message: "Student Updated Successfully" });
}

export async function deleteStudent(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Student Id" });
    }

    const db = getDB();
    const existing = await db.collection("students").findOne({ _id: new ObjectId(id) });
    const result = await db.collection("students").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Student Not Found" });
    }

    if (existing && existing.studentId) {
        await db.collection("users").deleteOne({ referenceId: existing.studentId, role: "student" });
    }

    emitEvent("student:deleted", {
        studentId: existing?.studentId,
        id
    });

    res.status(200).json({ success: true, message: "Student Deleted Successfully" });
}
