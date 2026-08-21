import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { isValidObjectId, formatDateDDMMYYYY, resolveReference, nextSequentialId } from "../utils/helpers.js";

function computeAmounts(fee) {
    const total = Math.max(0, Number(fee.totalFee) || 0);
    const paid = Math.max(0, Number(fee.paidFee) || 0);
    const due = Math.max(0, total - paid);

    fee.totalFee = total;
    fee.paidFee = paid;
    fee.dueFee = due;

    if (due <= 0 && total > 0) fee.status = "Paid";
    else if (paid > 0 && due > 0) fee.status = "Partial";
    else fee.status = "Pending";

    return fee;
}

async function enrichFee(db, fee, cache = {}) {
    const out = { ...fee };

    // ── Amounts: support both old schema (totalFees/paidAmount/pendingAmount)
    //            and new schema (totalFee/paidFee/dueFee) ──────────────────────
    const rawTotal = out.totalFee ?? out.totalFees ?? out.total ?? 0;
    const rawPaid  = out.paidFee  ?? out.paidAmount ?? out.paid  ?? 0;
    const total = Math.max(0, Number(rawTotal) || 0);
    const paid  = Math.max(0, Number(rawPaid)  || 0);
    const due   = Math.max(0, total - paid);

    out.totalFee = total;
    out.paidFee  = paid;
    out.dueFee   = due;

    // Recompute status if missing or stale
    if (!out.status || out.status === "Pending" && paid > 0) {
        if (due <= 0 && total > 0) out.status = "Paid";
        else if (paid > 0 && due > 0) out.status = "Partial";
        else out.status = "Pending";
    }

    // ── Student name ──────────────────────────────────────────────────────────
    let studentName = (out.studentName || out.student || "").trim();
    if ((!studentName || studentName === "Not Available") && out.studentId) {
        const key = `student_${out.studentId}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "students", out.studentId, "studentId");
        const s = cache[key];
        if (s) studentName = `${s.firstName || ""} ${s.lastName || ""}`.trim();
    }
    out.studentName = studentName || "Not Available";
    out.student = out.studentName;

    // ── Course name: if stored field looks like an ID (e.g. "CRS001"), resolve it
    let courseName = (out.courseName || out.course || "").trim();
    if ((!courseName || /^CRS\d+$/i.test(courseName)) && (out.courseId || /^CRS\d+$/i.test(courseName))) {
        const courseRef = out.courseId || courseName;
        const key = `course_${courseRef}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "courses", courseRef, "courseId");
        const c = cache[key];
        if (c) courseName = c.courseName || c.name || courseName;
    }
    out.courseName = courseName || "Not Available";
    out.course = out.courseName;

    // ── Batch name: same ID-vs-name resolution ─────────────────────────────
    let batchName = (out.batchName || out.batch || "").trim();
    if ((!batchName || /^BAT\d+$/i.test(batchName)) && (out.batchId || /^BAT\d+$/i.test(batchName))) {
        const batchRef = out.batchId || batchName;
        const key = `batch_${batchRef}`;
        if (!(key in cache)) cache[key] = await resolveReference(db, "batches", batchRef, "batchId");
        const b = cache[key];
        if (b) batchName = b.batchName || b.name || batchName;
    }
    out.batchName = batchName || "Not Available";
    out.batch = out.batchName;

    out.paymentDateFormatted = formatDateDDMMYYYY(out.paymentDate || out.createdAt);
    out.paymentMode = (out.paymentMode || "").trim() || "Not Available";

    return out;
}

export async function getFees(req, res) {
    const db = getDB();
    const fees = await db.collection("fees").find({}).sort({ createdAt: -1 }).toArray();
    const cache = {};
    const enriched = [];
    for (const fee of fees) enriched.push(await enrichFee(db, fee, cache));
    res.status(200).json(enriched);
}

export async function getFeeById(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Fee Id" });
    const db = getDB();
    const fee = await db.collection("fees").findOne({ _id: new ObjectId(id) });
    if (!fee) return res.status(404).json({ success: false, message: "Fee Record Not Found" });
    res.status(200).json(await enrichFee(db, fee));
}

export async function addFee(req, res) {
    const db = getDB();
    let fee = { ...(req.body || {}) };

    if (!fee.studentId) {
        return res.status(400).json({ success: false, message: "Student is required." });
    }

    // ── Validate transactionId uniqueness (only if provided) ──────────────────
    const txId = fee.transactionId ? String(fee.transactionId).trim() : "";
    if (txId) {
        const existingTx = await db.collection("fees").findOne({ transactionId: txId });
        if (existingTx) {
            return res.status(409).json({
                success: false,
                message: `Transaction ID "${txId}" already exists. Please use a unique Transaction ID for each payment.`
            });
        }
        fee.transactionId = txId;
    } else {
        // Do not store empty string — omit the field to avoid sparse-index collisions
        delete fee.transactionId;
    }

    // ── Generate unique feeId (FEE prefix) and receiptNo (RCPT prefix) ────────
    const feeId = await nextSequentialId(db, "fees", "feeId", "FEE");
    const receiptNo = await nextSequentialId(db, "fees", "receiptNo", "RCPT");
    fee.feeId = feeId;
    fee.receiptNo = receiptNo;

    // ── Compute amounts safely ─────────────────────────────────────────────────
    fee = computeAmounts(fee);
    fee.createdAt = new Date().toISOString();
    fee.updatedAt = new Date().toISOString();

    try {
        const result = await db.collection("fees").insertOne(fee);
        res.status(201).json({
            success: true,
            message: "Fee Record Added Successfully",
            insertedId: result.insertedId,
            feeId,
            receiptNo
        });
    } catch (err) {
        if (err.code === 11000) {
            // Identify which field caused the duplicate
            const keyValue = err.keyValue || {};
            if (keyValue.transactionId) {
                return res.status(409).json({
                    success: false,
                    message: `Transaction ID "${keyValue.transactionId}" already exists. Please use a unique Transaction ID.`
                });
            }
            if (keyValue.feeId) {
                return res.status(409).json({ success: false, message: "Fee ID conflict. Please retry." });
            }
            if (keyValue.receiptNo) {
                return res.status(409).json({ success: false, message: "Receipt number conflict. Please retry." });
            }
            return res.status(409).json({ success: false, message: "A duplicate record already exists." });
        }
        throw err; // Let global error handler handle other errors
    }
}

export async function updateFee(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Fee Id" });

    const db = getDB();
    let fee = { ...req.body };
    delete fee._id;
    delete fee.feeId;       // Never change the unique fee identifier
    delete fee.receiptNo;   // Never update the unique receipt number

    // ── Validate transactionId uniqueness if being updated ────────────────────
    if ("transactionId" in fee) {
        const txId = fee.transactionId ? String(fee.transactionId).trim() : "";
        if (txId) {
            const existingTx = await db.collection("fees").findOne({
                transactionId: txId,
                _id: { $ne: new ObjectId(id) }   // Exclude current record
            });
            if (existingTx) {
                return res.status(409).json({
                    success: false,
                    message: `Transaction ID "${txId}" already exists on another record. Please use a unique Transaction ID.`
                });
            }
            fee.transactionId = txId;
        } else {
            // Remove transactionId field entirely if cleared to avoid sparse-index null collision
            delete fee.transactionId;
            await db.collection("fees").updateOne(
                { _id: new ObjectId(id) },
                { $unset: { transactionId: "" } }
            );
        }
    }

    fee = computeAmounts(fee);
    fee.updatedAt = new Date().toISOString();

    try {
        const result = await db.collection("fees").updateOne({ _id: new ObjectId(id) }, { $set: fee });
        if (result.matchedCount === 0) return res.status(404).json({ success: false, message: "Fee Record Not Found" });
        res.status(200).json({ success: true, message: "Fee Record Updated Successfully" });
    } catch (err) {
        if (err.code === 11000) {
            const keyValue = err.keyValue || {};
            if (keyValue.transactionId) {
                return res.status(409).json({
                    success: false,
                    message: `Transaction ID "${keyValue.transactionId}" already exists. Please use a unique Transaction ID.`
                });
            }
            return res.status(409).json({ success: false, message: "A duplicate record already exists." });
        }
        throw err;
    }
}

export async function deleteFee(req, res) {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid Fee Id" });
    const db = getDB();
    const result = await db.collection("fees").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Fee Record Not Found" });
    res.status(200).json({ success: true, message: "Fee Record Deleted Successfully" });
}
