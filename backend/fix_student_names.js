import { connectDB, getDB } from './config/database.js';

/**
 * Fix stale "Not Available" courseName/batchName values stored in students documents.
 * These were written by a prior broken enrichment pass and are now stored persistently.
 * This script clears them so the live enrichment can re-resolve them correctly.
 */
async function fixStudentNames() {
    await connectDB();
    const db = getDB();

    // Build lookup maps directly using actual DB field names
    const courses = await db.collection('courses').find({}).toArray();
    const batches = await db.collection('batches').find({}).toArray();

    // Map by courseId and batchId (the actual field names in DB)
    const courseMap = {};
    for (const c of courses) {
        if (c.courseId) courseMap[c.courseId] = c.courseName || c.name || '';
        if (c._id) courseMap[String(c._id)] = c.courseName || c.name || '';
    }

    const batchMap = {};
    for (const b of batches) {
        if (b.batchId) batchMap[b.batchId] = b.batchName || b.name || '';
        if (b._id) batchMap[String(b._id)] = b.batchName || b.name || '';
    }

    const students = await db.collection('students').find({}).toArray();
    let fixedCount = 0;

    for (const student of students) {
        const update = {};

        // Fix courseName
        const resolvedCourseName = student.courseId ? (courseMap[student.courseId] || '') : '';
        const storedCourseName = student.courseName || '';
        if (resolvedCourseName && (storedCourseName === 'Not Available' || storedCourseName === '' || !storedCourseName)) {
            update.courseName = resolvedCourseName;
            update.course = resolvedCourseName;
        }

        // Fix batchName
        const resolvedBatchName = student.batchId ? (batchMap[student.batchId] || '') : '';
        const storedBatchName = student.batchName || '';
        if (resolvedBatchName && (storedBatchName === 'Not Available' || storedBatchName === '' || !storedBatchName)) {
            update.batchName = resolvedBatchName;
            update.batch = resolvedBatchName;
        }

        if (Object.keys(update).length > 0) {
            await db.collection('students').updateOne({ _id: student._id }, { $set: update });
            fixedCount++;
            console.log(`Fixed student ${student.firstName} ${student.lastName}: courseId=${student.courseId} -> courseName=${update.courseName || storedCourseName}, batchId=${student.batchId} -> batchName=${update.batchName || storedBatchName}`);
        }
    }

    // Also check batches for correct course names
    const batchesAll = await db.collection('batches').find({}).toArray();
    for (const batch of batchesAll) {
        const update = {};
        const resolvedCourseName = batch.courseId ? (courseMap[batch.courseId] || '') : '';
        if (resolvedCourseName && (!batch.courseName || batch.courseName === 'Not Available')) {
            update.courseName = resolvedCourseName;
        }
        if (Object.keys(update).length > 0) {
            await db.collection('batches').updateOne({ _id: batch._id }, { $set: update });
            console.log(`Fixed batch ${batch.batchName}: courseId=${batch.courseId} -> courseName=${update.courseName}`);
        }
    }

    console.log(`\nFixed ${fixedCount} student records with correct course/batch names.`);
    process.exit(0);
}

fixStudentNames().catch(err => { console.error(err); process.exit(1); });
