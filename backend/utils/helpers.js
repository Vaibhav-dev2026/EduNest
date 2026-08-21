import { ObjectId } from "mongodb";

/**
 * Checks whether a value is a syntactically valid MongoDB ObjectId string.
 */
export function isValidObjectId(value) {
    return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Formats any Date / ISO string / timestamp as DD/MM/YYYY.
 * Returns "Not Available" if the value is missing or invalid.
 */
export function formatDateDDMMYYYY(dateValue) {
    if (!dateValue) return "Not Available";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Not Available";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

/**
 * Resolves a Course / Batch / Teacher / Student reference across any identifier format:
 * MongoDB _id, business code (courseId / courseCode, batchId / batchCode, teacherId, studentId),
 * or readable name.
 */
export async function resolveReference(db, collectionName, value, codeField) {
    if (!value || String(value).trim() === "") return null;
    const strVal = String(value).trim();

    try {
        if (isValidObjectId(strVal)) {
            const byId = await db.collection(collectionName).findOne({ _id: new ObjectId(strVal) });
            if (byId) return byId;
        }

        const queryFields = [];
        if (codeField) queryFields.push(codeField);

        if (collectionName === "courses") {
            queryFields.push("courseId", "courseCode", "courseName", "name");
        } else if (collectionName === "batches") {
            queryFields.push("batchId", "batchCode", "batchName", "name");
        } else if (collectionName === "teachers") {
            queryFields.push("teacherId", "email", "name", "teacherName", "firstName", "lastName");
            const parts = strVal.split(/\s+/);
            if (parts.length >= 2) {
                const byFullName = await db.collection("teachers").findOne({
                    firstName: { $regex: new RegExp(`^${escapeRegex(parts[0])}$`, "i") },
                    lastName: { $regex: new RegExp(`^${escapeRegex(parts.slice(1).join(" "))}$`, "i") }
                });
                if (byFullName) return byFullName;
            }
        } else if (collectionName === "students") {
            queryFields.push("studentId", "email", "name", "studentName", "firstName", "lastName");
            const parts = strVal.split(/\s+/);
            if (parts.length >= 2) {
                const byFullName = await db.collection("students").findOne({
                    firstName: { $regex: new RegExp(`^${escapeRegex(parts[0])}$`, "i") },
                    lastName: { $regex: new RegExp(`^${escapeRegex(parts.slice(1).join(" "))}$`, "i") }
                });
                if (byFullName) return byFullName;
            }
        }

        const uniqueFields = Array.from(new Set(queryFields));
        const orConditions = uniqueFields.map(f => ({
            [f]: { $regex: new RegExp(`^${escapeRegex(strVal)}$`, "i") }
        }));

        const byCode = await db.collection(collectionName).findOne({ $or: orConditions });
        if (byCode) return byCode;
    } catch (error) {
        return null;
    }

    return null;
}

export function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates the next sequential business ID for a collection, e.g. EDU003, TCH004.
 */
export async function nextSequentialId(db, collectionName, field, prefix, pad = 3) {
    const regex = new RegExp(`^${prefix}\\d+$`, "i");
    const existing = await db
        .collection(collectionName)
        .find({ $or: [{ [field]: { $regex: regex } }, { [`${field.replace("Code", "Id")}`]: { $regex: regex } }] })
        .toArray();

    let nextNum = 1;
    if (existing.length > 0) {
        const nums = existing
            .map(doc => {
                const val = doc[field] || doc[`${field.replace("Code", "Id")}`] || "";
                return parseInt(String(val).replace(new RegExp(`^${prefix}`, "i"), ""), 10);
            })
            .filter(n => !isNaN(n));
        if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    }

    return prefix + String(nextNum).padStart(pad, "0");
}

/** Standard success envelope. */
export function ok(res, data, status = 200) {
    return res.status(status).json(data);
}

/** Standard error envelope (used mainly by the central error handler). */
export function fail(res, status, message) {
    return res.status(status).json({ success: false, message });
}
