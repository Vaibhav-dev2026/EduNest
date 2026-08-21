import { getDB } from "../config/database.js";
import { generateToken } from "../utils/token.js";
import { hashPassword, verifyPassword, isHashed } from "../utils/password.js";
import { nextSequentialId, resolveReference } from "../utils/helpers.js";

const ID_RULES = {
    teacher: { collection: "teachers", field: "teacherId", prefix: "TCH" },
    student: { collection: "students", field: "studentId", prefix: "EDU" }
};

export async function login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const db = getDB();
    const user = await db.collection("users").findOne({ email: String(email).toLowerCase() });

    if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status !== "Active") {
        return res.status(403).json({ success: false, message: "Account is inactive. Contact Administrator." });
    }

    // Transparently upgrade legacy plain-text passwords to a hash on next successful login
    if (!isHashed(user.password)) {
        await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { password: hashPassword(password) } }
        );
    }

    let profilePhoto = user.profilePhoto || user.photo || "";
    let resolvedFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName || "";

    // Resolve linked profile photo and name if missing
    if (user.role === "teacher") {
        const teacherRef = user.referenceId || user.teacherId;
        let teacher = null;
        if (teacherRef) teacher = await resolveReference(db, "teachers", teacherRef, "teacherId");
        if (!teacher) teacher = await db.collection("teachers").findOne({ email: user.email });
        if (teacher) {
            if (!profilePhoto && (teacher.profilePhoto || teacher.photo)) {
                profilePhoto = teacher.profilePhoto || teacher.photo;
            }
            if (!resolvedFullName && (teacher.firstName || teacher.lastName)) {
                resolvedFullName = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
            }
        }
    } else if (user.role === "student") {
        const studentRef = user.referenceId || user.studentId;
        let student = null;
        if (studentRef) student = await resolveReference(db, "students", studentRef, "studentId");
        if (!student) student = await db.collection("students").findOne({ email: user.email });
        if (student) {
            if (!profilePhoto && (student.profilePhoto || student.photo)) {
                profilePhoto = student.profilePhoto || student.photo;
            }
            if (!resolvedFullName && (student.firstName || student.lastName)) {
                resolvedFullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
            }
        }
    }

    const token = generateToken(user);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            _id: user._id,
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: resolvedFullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            email: user.email,
            role: user.role,
            referenceId: user.referenceId,
            status: user.status,
            profilePhoto,
            photo: profilePhoto
        }
    });
}

export async function signup(req, res) {
    const data = req.body || {};

    if (!data.email || !data.password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const db = getDB();
    const emailLower = String(data.email).toLowerCase();

    const existingUser = await db.collection("users").findOne({ email: emailLower });
    if (existingUser) {
        return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const nameParts = (data.fullName || "").trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const allowedRoles = ["admin", "teacher", "student"];
    const incomingRole = (data.role || "").toLowerCase();
    const userRole = allowedRoles.includes(incomingRole) ? incomingRole : "student";

    let referenceId = null;
    if (ID_RULES[userRole]) {
        const rule = ID_RULES[userRole];
        referenceId = await nextSequentialId(db, rule.collection, rule.field, rule.prefix);
    }

    const now = new Date().toISOString();

    const newUser = {
        userId: `USR${Date.now().toString().slice(-6)}`,
        firstName,
        lastName,
        mobile: data.mobile || "",
        email: emailLower,
        gender: data.gender || "",
        password: hashPassword(data.password),
        role: userRole,
        referenceId,
        status: "Active",
        profilePhoto: "",
        photo: "",
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection("users").insertOne(newUser);

    if (userRole === "teacher") {
        await db.collection("teachers").insertOne({
            teacherId: referenceId,
            firstName,
            lastName,
            mobile: data.mobile || "",
            email: emailLower,
            gender: data.gender || "",
            status: "Active",
            profilePhoto: "",
            photo: "",
            createdAt: now,
            updatedAt: now
        });
    } else if (userRole === "student") {
        await db.collection("students").insertOne({
            studentId: referenceId,
            firstName,
            lastName,
            mobile: data.mobile || "",
            email: emailLower,
            gender: data.gender || "",
            status: "Active",
            joiningDate: now,
            profilePhoto: "",
            photo: "",
            createdAt: now,
            updatedAt: now
        });
    }

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        insertedId: result.insertedId,
        referenceId
    });
}
