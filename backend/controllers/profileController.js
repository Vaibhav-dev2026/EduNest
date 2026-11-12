import { ObjectId } from "mongodb";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getDB } from "../config/database.js";
import { resolveReference, formatDateDDMMYYYY } from "../utils/helpers.js";
import { emitEvent } from "../services/socketService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_DIR = path.join(__dirname, "..", "uploads", "profiles");

// Ensure profiles directory exists
if (!fs.existsSync(PROFILES_DIR)) {
    fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

/**
 * Safely delete an old profile photo from disk.
 * Prevents path traversal and only touches backend/uploads/profiles/.
 */
function safeDeleteOldPhoto(photoPath) {
    if (!photoPath || typeof photoPath !== "string" || !photoPath.startsWith("/uploads/profiles/")) return;
    try {
        const filename = path.basename(photoPath);
        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) return;
        const fullPath = path.join(PROFILES_DIR, filename);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        console.error("Failed to unlink old profile photo:", err.message);
    }
}

/**
 * GET /profile
 * Retrieves the fresh profile data for the authenticated user across Admin, Teacher, or Student.
 */
export async function getProfile(req, res) {
    const db = getDB();
    const currentUser = req.user; // Populated by authenticate() middleware
    const userRole = (currentUser.role || "").toLowerCase();

    let profileData = {
        id: currentUser._id,
        _id: currentUser._id,
        userId: currentUser.userId || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        fullName: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.fullName || "User",
        email: currentUser.email || "",
        mobile: currentUser.mobile || "",
        gender: currentUser.gender || "",
        address: currentUser.address || "",
        role: currentUser.role || "user",
        referenceId: currentUser.referenceId || "",
        status: currentUser.status || "Active",
        profilePhoto: currentUser.profilePhoto || currentUser.photo || "",
        photo: currentUser.profilePhoto || currentUser.photo || "",
        createdAt: currentUser.createdAt || "",
        updatedAt: currentUser.updatedAt || ""
    };

    if (userRole === "teacher") {
        const teacherRef = currentUser.referenceId || currentUser.teacherId || "";
        let teacher = null;
        if (teacherRef) {
            teacher = await resolveReference(db, "teachers", teacherRef, "teacherId");
        }
        if (!teacher && currentUser.email) {
            teacher = await db.collection("teachers").findOne({
                email: { $regex: new RegExp(`^${currentUser.email}$`, "i") }
            });
        }

        if (teacher) {
            profileData = {
                ...profileData,
                ...teacher,
                id: currentUser._id,
                _id: teacher._id,
                teacherId: teacher.teacherId || teacherRef,
                firstName: teacher.firstName || profileData.firstName,
                lastName: teacher.lastName || profileData.lastName,
                fullName: `${teacher.firstName || profileData.firstName || ""} ${teacher.lastName || profileData.lastName || ""}`.trim(),
                email: teacher.email || profileData.email,
                mobile: teacher.mobile || profileData.mobile,
                gender: teacher.gender || profileData.gender,
                dob: teacher.dob || teacher.dateOfBirth || "",
                dobFormatted: formatDateDDMMYYYY(teacher.dob || teacher.dateOfBirth),
                qualification: teacher.qualification || "",
                specialization: teacher.specialization || teacher.subject || "",
                subject: teacher.subject || teacher.specialization || "",
                experience: teacher.experience !== undefined && teacher.experience !== null ? String(teacher.experience) : "0",
                joiningDate: teacher.joiningDate || "",
                joiningDateFormatted: formatDateDDMMYYYY(teacher.joiningDate || teacher.createdAt),
                salary: teacher.salary || "",
                address: teacher.address || profileData.address,
                status: teacher.status || profileData.status,
                profilePhoto: teacher.profilePhoto || teacher.photo || profileData.profilePhoto,
                photo: teacher.profilePhoto || teacher.photo || profileData.photo
            };
        }
    } else if (userRole === "student") {
        const studentRef = currentUser.referenceId || currentUser.studentId || "";
        let student = null;
        if (studentRef) {
            student = await resolveReference(db, "students", studentRef, "studentId");
        }
        if (!student && currentUser.email) {
            student = await db.collection("students").findOne({
                email: { $regex: new RegExp(`^${currentUser.email}$`, "i") }
            });
        }

        if (student) {
            let courseName = (student.courseName || student.course || "").trim();
            if ((!courseName || courseName === "Not Available") && student.courseId) {
                const c = await resolveReference(db, "courses", student.courseId, "courseId");
                if (c) courseName = c.courseName || c.name || "";
            }

            let batchName = (student.batchName || student.batch || "").trim();
            if ((!batchName || batchName === "Not Available") && student.batchId) {
                const b = await resolveReference(db, "batches", student.batchId, "batchId");
                if (b) batchName = b.batchName || b.name || "";
            }

            profileData = {
                ...profileData,
                ...student,
                id: currentUser._id,
                _id: student._id,
                studentId: student.studentId || studentRef,
                firstName: student.firstName || profileData.firstName,
                lastName: student.lastName || profileData.lastName,
                fullName: `${student.firstName || profileData.firstName || ""} ${student.lastName || profileData.lastName || ""}`.trim(),
                email: student.email || profileData.email,
                mobile: student.mobile || profileData.mobile,
                gender: student.gender || profileData.gender,
                dob: student.dob || student.dateOfBirth || "",
                dobFormatted: formatDateDDMMYYYY(student.dob || student.dateOfBirth),
                courseId: student.courseId || "",
                courseName: courseName || student.course || "",
                batchId: student.batchId || "",
                batchName: batchName || student.batch || "",
                joiningDate: student.joiningDate || "",
                joiningDateFormatted: formatDateDDMMYYYY(student.joiningDate || student.createdAt),
                address: student.address || profileData.address,
                status: student.status || profileData.status,
                profilePhoto: student.profilePhoto || student.photo || profileData.profilePhoto,
                photo: student.profilePhoto || student.photo || profileData.photo
            };
        }
    }

    // Ensure all response shape paradigms are supported seamlessly
    res.status(200).json({
        ...profileData,
        success: true,
        profile: profileData,
        data: { profile: profileData },
        user: profileData
    });
}

/**
 * PUT /profile
 * Updates profile details and/or uploads a new profile photo across Admin, Teacher, or Student.
 */
export async function updateProfile(req, res) {
    const db = getDB();
    const currentUser = req.user;
    const userRole = (currentUser.role || "").toLowerCase();
    const body = req.body || {};
    const uploadedFile = req.file;

    const now = new Date().toISOString();
    let newPhotoUrl = null;

    if (uploadedFile) {
        newPhotoUrl = `/uploads/profiles/${uploadedFile.filename}`;
    }

    // ── Build update object for users collection ──
    const userUpdate = {
        updatedAt: now
    };

    if (body.firstName !== undefined) userUpdate.firstName = String(body.firstName).trim();
    if (body.lastName !== undefined) userUpdate.lastName = String(body.lastName).trim();
    if (body.mobile !== undefined) userUpdate.mobile = String(body.mobile).trim();
    if (body.gender !== undefined) userUpdate.gender = String(body.gender).trim();
    if (body.address !== undefined) userUpdate.address = String(body.address).trim();

    if (newPhotoUrl) {
        // Delete old photo from disk if replacing
        const oldPhoto = currentUser.profilePhoto || currentUser.photo;
        if (oldPhoto && oldPhoto !== newPhotoUrl) {
            safeDeleteOldPhoto(oldPhoto);
        }
        userUpdate.profilePhoto = newPhotoUrl;
        userUpdate.photo = newPhotoUrl;
    } else if (body.profilePhoto || body.photo) {
        const directPhoto = String(body.profilePhoto || body.photo).trim();
        if (directPhoto) {
            userUpdate.profilePhoto = directPhoto;
            userUpdate.photo = directPhoto;
        }
    }

    // Update users document
    await db.collection("users").updateOne(
        { _id: new ObjectId(currentUser._id) },
        { $set: userUpdate }
    );

    // ── If Teacher: update linked teachers document ──
    if (userRole === "teacher") {
        const teacherRef = currentUser.referenceId || currentUser.teacherId || "";
        let teacherFilter = null;
        if (teacherRef) {
            teacherFilter = { teacherId: { $regex: new RegExp(`^${teacherRef}$`, "i") } };
        } else if (currentUser.email) {
            teacherFilter = { email: { $regex: new RegExp(`^${currentUser.email}$`, "i") } };
        }

        if (teacherFilter) {
            const existingTeacher = await db.collection("teachers").findOne(teacherFilter);
            if (existingTeacher) {
                const teacherUpdate = { updatedAt: now };
                if (userUpdate.firstName) teacherUpdate.firstName = userUpdate.firstName;
                if (userUpdate.lastName) teacherUpdate.lastName = userUpdate.lastName;
                if (userUpdate.mobile !== undefined) teacherUpdate.mobile = userUpdate.mobile;
                if (userUpdate.gender !== undefined) teacherUpdate.gender = userUpdate.gender;
                if (userUpdate.address !== undefined) teacherUpdate.address = userUpdate.address;
                if (userUpdate.profilePhoto) {
                    teacherUpdate.profilePhoto = userUpdate.profilePhoto;
                    teacherUpdate.photo = userUpdate.profilePhoto;
                }

                if (body.dob !== undefined) teacherUpdate.dob = body.dob;
                if (body.qualification !== undefined) teacherUpdate.qualification = String(body.qualification).trim();
                if (body.specialization !== undefined) teacherUpdate.specialization = String(body.specialization).trim();
                if (body.subject !== undefined) teacherUpdate.subject = String(body.subject).trim();
                if (body.experience !== undefined) teacherUpdate.experience = body.experience;
                if (body.salary !== undefined) teacherUpdate.salary = body.salary;
                if (body.joiningDate !== undefined) teacherUpdate.joiningDate = body.joiningDate;

                await db.collection("teachers").updateOne({ _id: existingTeacher._id }, { $set: teacherUpdate });
            }
        }
    }

    // ── If Student: update linked students document ──
    if (userRole === "student") {
        const studentRef = currentUser.referenceId || currentUser.studentId || "";
        let studentFilter = null;
        if (studentRef) {
            studentFilter = { studentId: { $regex: new RegExp(`^${studentRef}$`, "i") } };
        } else if (currentUser.email) {
            studentFilter = { email: { $regex: new RegExp(`^${currentUser.email}$`, "i") } };
        }

        if (studentFilter) {
            const existingStudent = await db.collection("students").findOne(studentFilter);
            if (existingStudent) {
                const studentUpdate = { updatedAt: now };
                if (userUpdate.firstName) studentUpdate.firstName = userUpdate.firstName;
                if (userUpdate.lastName) studentUpdate.lastName = userUpdate.lastName;
                if (userUpdate.mobile !== undefined) studentUpdate.mobile = userUpdate.mobile;
                if (userUpdate.gender !== undefined) studentUpdate.gender = userUpdate.gender;
                if (userUpdate.address !== undefined) studentUpdate.address = userUpdate.address;
                if (userUpdate.profilePhoto) {
                    studentUpdate.profilePhoto = userUpdate.profilePhoto;
                    studentUpdate.photo = userUpdate.profilePhoto;
                }

                if (body.dob !== undefined) studentUpdate.dob = body.dob;
                if (body.joiningDate !== undefined) studentUpdate.joiningDate = body.joiningDate;

                await db.collection("students").updateOne({ _id: existingStudent._id }, { $set: studentUpdate });
            }
        }
    }

    // Fetch the updated fresh user document
    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(currentUser._id) });

    const finalPhoto = updatedUser.profilePhoto || updatedUser.photo || "";
    const fullName = `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || updatedUser.fullName || "User";

    const updatedUserObj = {
        id: updatedUser._id,
        _id: updatedUser._id,
        userId: updatedUser.userId,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        address: updatedUser.address,
        role: updatedUser.role,
        referenceId: updatedUser.referenceId,
        status: updatedUser.status,
        profilePhoto: finalPhoto,
        photo: finalPhoto
    };

    emitEvent("profile:updated", {
        userId: updatedUser._id.toString(),
        referenceId: updatedUser.referenceId,
        role: updatedUser.role,
        photo: finalPhoto
    });

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
        user: updatedUserObj,
        profile: updatedUserObj,
        data: { profile: updatedUserObj, user: updatedUserObj }
    });
}
