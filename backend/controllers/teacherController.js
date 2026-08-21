import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { isValidObjectId, formatDateDDMMYYYY, nextSequentialId } from "../utils/helpers.js";

function enrichTeacher(t) {
    const out = { ...t };
    out.joiningDateFormatted = formatDateDDMMYYYY(out.joiningDate || out.createdAt);
    out.dobFormatted = formatDateDDMMYYYY(out.dob || out.dateOfBirth);

    out.mobile = out.mobile !== undefined && out.mobile !== null && String(out.mobile).trim() !== ""
        ? String(out.mobile).trim()
        : "Not Available";

    out.gender = out.gender !== undefined && out.gender !== null && String(out.gender).trim() !== ""
        ? String(out.gender).trim()
        : "Not Available";

    out.qualification = out.qualification !== undefined && out.qualification !== null && String(out.qualification).trim() !== ""
        ? String(out.qualification).trim()
        : "Not Available";

    out.specialization = out.specialization !== undefined && out.specialization !== null && String(out.specialization).trim() !== ""
        ? String(out.specialization).trim()
        : (out.subject !== undefined && out.subject !== null && String(out.subject).trim() !== "" ? String(out.subject).trim() : "Not Available");

    out.subject = out.subject !== undefined && out.subject !== null && String(out.subject).trim() !== ""
        ? String(out.subject).trim()
        : out.specialization;

    out.status = out.status !== undefined && out.status !== null && String(out.status).trim() !== ""
        ? String(out.status).trim()
        : "Active";

    out.address = out.address !== undefined && out.address !== null && String(out.address).trim() !== ""
        ? String(out.address).trim()
        : "Not Available";

    out.experience = (out.experience !== undefined && out.experience !== null && String(out.experience).trim() !== "")
        ? String(out.experience)
        : "0";

    out.profilePhoto = out.profilePhoto || out.photo || "";
    out.photo = out.profilePhoto || out.photo || "";

    return out;
}

export async function getTeachers(req, res) {
    const db = getDB();
    const teachers = await db.collection("teachers").find({}).toArray();
    res.status(200).json(teachers.map(enrichTeacher));
}

export async function getTeacherById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Teacher Id" });
    }
    const db = getDB();
    const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(id) });
    if (!teacher) {
        return res.status(404).json({ success: false, message: "Teacher Not Found" });
    }
    res.status(200).json(enrichTeacher(teacher));
}

// GET /teachers/profile — resolves the logged-in teacher's own profile.
// Matching priority: referenceId → teacherId → email.
export async function getTeacherProfile(req, res) {
    const db = getDB();
    const referenceId = (req.query.referenceId || "").trim();
    const teacherIdParam = (req.query.teacherId || "").trim();
    const email = (req.query.email || "").trim().toLowerCase();

    if (!referenceId && !teacherIdParam && !email) {
        return res.status(400).json({ success: false, message: "referenceId, teacherId or email is required" });
    }

    let teacher = null;
    const idToMatch = referenceId || teacherIdParam;

    if (idToMatch) {
        teacher = await db.collection("teachers").findOne({
            teacherId: { $regex: new RegExp(`^${idToMatch}$`, "i") }
        });
    }

    if (!teacher && email) {
        teacher = await db.collection("teachers").findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") }
        });
    }

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: "No teacher profile found. Please ask the Admin to create your profile."
        });
    }

    res.status(200).json(enrichTeacher(teacher));
}

export async function addTeacher(req, res) {
    const db = getDB();
    const teacher = req.body || {};

    if (!teacher.firstName || !teacher.lastName) {
        return res.status(400).json({ success: false, message: "First name and last name are required." });
    }

    const generatedId = await nextSequentialId(db, "teachers", "teacherId", "TCH");
    teacher.teacherId = generatedId;
    teacher.createdAt = new Date().toISOString();
    teacher.updatedAt = new Date().toISOString();

    const result = await db.collection("teachers").insertOne(teacher);

    // ── Also create a login account so the teacher can actually sign in ──
    let loginCreated = false;
    let tempPassword = null;
    const email = (teacher.email || "").trim().toLowerCase();

    if (email) {
        const existingUser = await db.collection("users").findOne({ email });
        if (!existingUser) {
            tempPassword = /^\d{10}$/.test(String(teacher.mobile || "")) ? String(teacher.mobile) : `${generatedId}@123`;
            await db.collection("users").insertOne({
                userId: `USR${Date.now().toString().slice(-6)}`,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                mobile: teacher.mobile || "",
                email,
                gender: teacher.gender || "",
                password: hashPassword(tempPassword),
                role: "teacher",
                referenceId: generatedId,
                status: teacher.status || "Active",
                profilePhoto: teacher.profilePhoto || teacher.photo || "",
                photo: teacher.profilePhoto || teacher.photo || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            loginCreated = true;
        }
    }

    res.status(201).json({
        success: true,
        message: "Teacher Added Successfully",
        insertedId: result.insertedId,
        teacherId: generatedId,
        loginCreated,
        tempPassword: loginCreated ? tempPassword : undefined,
        loginNote: !email
            ? "No email was provided, so no login account was created for this teacher."
            : (loginCreated
                ? `A login account was created. Share these credentials with the teacher: ${email} / ${tempPassword}`
                : "An account with this email already exists — it was left unchanged.")
    });
}

export async function updateTeacher(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Teacher Id" });
    }

    const db = getDB();
    const teacher = { ...req.body };
    delete teacher._id;
    delete teacher.teacherId; // Never allow the unique teacherId to be overwritten
    teacher.updatedAt = new Date().toISOString();

    const existing = await db.collection("teachers").findOne({ _id: new ObjectId(id) });
    if (!existing) {
        return res.status(404).json({ success: false, message: "Teacher Not Found" });
    }

    await db.collection("teachers").updateOne({ _id: new ObjectId(id) }, { $set: teacher });

    if (existing.teacherId) {
        const userUpdate = {};
        if (teacher.firstName) userUpdate.firstName = teacher.firstName;
        if (teacher.lastName) userUpdate.lastName = teacher.lastName;
        if (teacher.status) userUpdate.status = teacher.status;
        if (teacher.profilePhoto || teacher.photo) {
            userUpdate.profilePhoto = teacher.profilePhoto || teacher.photo;
            userUpdate.photo = teacher.profilePhoto || teacher.photo;
        }
        if (Object.keys(userUpdate).length > 0) {
            await db.collection("users").updateOne(
                { referenceId: existing.teacherId, role: "teacher" },
                { $set: userUpdate }
            );
        }
    }

    res.status(200).json({ success: true, message: "Teacher Updated Successfully" });
}

export async function deleteTeacher(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid Teacher Id" });
    }

    const db = getDB();
    const existing = await db.collection("teachers").findOne({ _id: new ObjectId(id) });
    const result = await db.collection("teachers").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Teacher Not Found" });
    }

    if (existing && existing.teacherId) {
        await db.collection("users").deleteOne({ referenceId: existing.teacherId, role: "teacher" });
    }

    res.status(200).json({ success: true, message: "Teacher Deleted Successfully" });
}
