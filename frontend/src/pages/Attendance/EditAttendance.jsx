import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getAttendanceById, updateAttendance } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getBatches } from "../../services/batchService";

function EditAttendance() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [attendance, setAttendance] = useState({
        attendanceDate: "",
        batchId: "",
        batchName: "",
        studentId: "",
        studentName: "",
        status: "Present",
        remarks: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadAll() {
            setLoadingData(true);
            try {
                const [record, studentsData, batchesData] = await Promise.all([
                    getAttendanceById(id),
                    getStudents(),
                    getBatches()
                ]);

                setStudents(studentsData || []);
                setBatches(batchesData || []);

                if (record) {
                    setAttendance({
                        attendanceDate: record.attendanceDate || "",
                        batchId: record.batchId || record.batch || "",
                        batchName: record.batchName || record.batch || "",
                        studentId: record.studentId || record.student || "",
                        studentName: record.studentName || record.student || "",
                        status: record.status || "Present",
                        remarks: record.remarks || ""
                    });
                }
            } catch (error) {
                setApiError("Failed to load attendance record.");
            } finally {
                setLoadingData(false);
            }
        }
        loadAll();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "studentId") {
            const selectedStudent = students.find(
                s => (s.studentId || s._id) === value
            );
            setAttendance(prev => ({
                ...prev,
                studentId: value,
                studentName: selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()
                    : prev.studentName
            }));
        } else if (name === "batchId") {
            const selectedBatch = batches.find(
                b => (b.batchCode || String(b._id)) === value
            );
            setAttendance(prev => ({
                ...prev,
                batchId: value,
                batchName: selectedBatch ? selectedBatch.batchName : prev.batchName
            }));
        } else {
            setAttendance(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!attendance.attendanceDate || !attendance.studentId || !attendance.status) {
            setApiError("Attendance Date, Student, and Status are required.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                attendanceDate: attendance.attendanceDate,
                batchId: attendance.batchId,
                batchName: attendance.batchName,
                studentId: attendance.studentId,
                studentName: attendance.studentName,
                status: attendance.status,
                remarks: attendance.remarks
            };
            await updateAttendance(id, payload);
            setApiSuccess("Attendance Updated Successfully!");
            setTimeout(() => navigate("/attendance"), 1500);
        } catch (error) {
            setApiError(error.message || "Failed To Update Attendance");
            setIsSaving(false);
        }
    };

    if (loadingData) {
        return (
            <AdminLayout>
                <PageHeader title="Edit Attendance" subtitle="Update Attendance Record" />
                <Loader text="Loading attendance record..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <PageHeader title="Edit Attendance" subtitle="Update Attendance Record" />
            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row">

                            {/* Attendance Date */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Attendance Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="attendanceDate"
                                    value={attendance.attendanceDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Batch — loaded from DB */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch</label>
                                <select
                                    className="form-select"
                                    name="batchId"
                                    value={attendance.batchId}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(b => (
                                        <option key={b._id} value={b.batchCode || String(b._id)}>
                                            {b.batchName} {b.batchCode ? `(${b.batchCode})` : ""}
                                        </option>
                                    ))}
                                    {/* Fallback: keep the existing value visible if not in current list */}
                                    {attendance.batchId && !batches.some(b => (b.batchCode || String(b._id)) === attendance.batchId) && (
                                        <option value={attendance.batchId}>{attendance.batchName || attendance.batchId}</option>
                                    )}
                                </select>
                            </div>

                            {/* Student — loaded from DB */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Student <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="studentId"
                                    value={attendance.studentId}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s.studentId || String(s._id)}>
                                            {s.firstName} {s.lastName}
                                            {s.studentId ? ` (${s.studentId})` : ""}
                                        </option>
                                    ))}
                                    {/* Fallback: keep existing value visible if not in list */}
                                    {attendance.studentId && !students.some(s => (s.studentId || String(s._id)) === attendance.studentId) && (
                                        <option value={attendance.studentId}>{attendance.studentName || attendance.studentId}</option>
                                    )}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={attendance.status}
                                    onChange={handleChange}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                            </div>

                            {/* Remarks */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    name="remarks"
                                    value={attendance.remarks}
                                    onChange={handleChange}
                                    placeholder="Enter Remarks"
                                ></textarea>
                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Update Attendance"}
                                className="btn btn-success"
                                disabled={isSaving}
                            />
                            <Button
                                type="button"
                                text="Cancel"
                                className="btn btn-secondary"
                                onClick={() => navigate("/attendance")}
                                disabled={isSaving}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default EditAttendance;
