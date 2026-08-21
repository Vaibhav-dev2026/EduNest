import { connectDB, getDB } from './config/database.js';

async function checkData() {
    await connectDB();
    const db = getDB();
    
    // Check courses
    const course = await db.collection('courses').findOne({});
    console.log('\n--- COURSE ---');
    console.log('Fields:', Object.keys(course));
    console.log('courseName:', course.courseName, '| courseCode:', course.courseCode, '| name:', course.name, '| courseId:', course.courseId);
    
    // Check batches
    const batch = await db.collection('batches').findOne({});
    console.log('\n--- BATCH ---');
    console.log('Fields:', Object.keys(batch));
    console.log('batchName:', batch.batchName, '| batchCode:', batch.batchCode, '| name:', batch.name, '| batchId:', batch.batchId);
    
    // Check full material document
    const mat = await db.collection('materials').findOne({});
    console.log('\n--- MATERIAL ---');
    console.log('Fields:', Object.keys(mat));
    console.log('title:', mat.title, '| course:', mat.course, '| courseName:', mat.courseName, '| courseId:', mat.courseId, '| fileUrl:', mat.fileUrl);
    
    // Check full student
    const stu = await db.collection('students').findOne({});
    console.log('\n--- STUDENT ---');
    console.log('Fields:', Object.keys(stu));
    console.log('Name:', stu.firstName, stu.lastName, '| courseId:', stu.courseId, '| batchId:', stu.batchId, '| courseName:', stu.courseName);
    
    // Verify CRS001 resolves
    const c = await db.collection('courses').findOne({ courseCode: 'CRS001' });
    console.log('\nCRS001 by courseCode:', c ? (c.courseName || c.name) : 'NOT FOUND');
    const c2 = await db.collection('courses').findOne({ courseId: 'CRS001' });
    console.log('CRS001 by courseId:', c2 ? (c2.courseName || c2.name) : 'NOT FOUND');
    
    process.exit(0);
}

checkData().catch(err => { console.error(err); process.exit(1); });
