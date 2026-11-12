import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { addAttendance } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getBatches } from "../../services/batchService";
import { getCurrentUser } from "../../services/authService";

function MarkAttendance() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [dataError, setDataError] = useState(null);

    const [attendance, setAttendance] = useState({
        attendanceDate: "",
        batchId: "",
        batchName: "",
        studentId: "",
        studentName: "",
        status: "Present",
        remarks: ""
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    // Load students and batches on mount
    useEffect(() => {
        async function loadFormData() {
            setLoadingData(true);
            setDataError(null);
            try {
                const [studentsData, batchesData] = await Promise.all([
                    getStudents(),
                    getBatches()
                ]);
                setStudents(studentsData || []);
                setBatches(batchesData || []);
            } catch (err) {
                setDataError("Failed to load students or batches. Please refresh.");
            } finally {
                setLoadingData(false);
            }
        }
        loadFormData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "studentId") {
            // Auto-populate studentName when a student is selected
            const selectedStudent = students.find(
                s => (s.studentId || s._id) === value
            );
            setAttendance(prev => ({
                ...prev,
                studentId: value,
                studentName: selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim()
                    : ""
            }));
        } else if (name === "batchId") {
            // Auto-populate batchName when a batch is selected
            const selectedBatch = batches.find(
                b => (b.batchCode || String(b._id)) === value
            );
            setAttendance(prev => ({
                ...prev,
                batchId: value,
                batchName: selectedBatch ? selectedBatch.batchName : ""
            }));
        } else {
            setAttendance(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        let validationErrors = {};

        if (!attendance.attendanceDate) {
            validationErrors.attendanceDate = "Attendance Date is required";
        }
        if (!attendance.batchId) {
            validationErrors.batchId = "Please Select a Batch";
        }
        if (!attendance.studentId) {
            validationErrors.studentId = "Please Select a Student";
        }
        if (!attendance.status) {
            validationErrors.status = "Status is required";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const currentUser = getCurrentUser() || {};
            const payload = {
                attendanceDate: attendance.attendanceDate,
                batchId: attendance.batchId,
                batchName: attendance.batchName,
                studentId: attendance.studentId,
                studentName: attendance.studentName,
                status: attendance.status,
                remarks: attendance.remarks,
                // Teacher info from current user session
                teacherId: currentUser.referenceId || currentUser.teacherId || "",
                teacherName: currentUser.fullName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || ""
            };

            await addAttendance(payload);
            setApiSuccess("Attendance Marked Successfully!");
            setTimeout(() => navigate("/attendance"), 1500);
        } catch (error) {
            setApiError(error.message || "Failed To Mark Attendance");
            setIsSaving(false);
        }
    };

    if (loadingData) {
        return (
            <AdminLayout>
                <PageHeader title="Mark Attendance" subtitle="Student Attendance Management" />
                <Loader text="Loading students and batches..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>

            <PageHeader
                title="Mark Attendance"
                subtitle="Student Attendance Management"
            />

            <div className="card shadow-sm">
                <div className="card-body">

                    {dataError && <div className="alert alert-warning">{dataError}</div>}
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            {/* Attendance Date */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Attendance Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.attendanceDate ? "is-invalid" : ""}`}
                                    name="attendanceDate"
                                    value={attendance.attendanceDate}
                                    onChange={handleChange}
                                />
                                {errors.attendanceDate && (
                                    <div className="invalid-feedback">{errors.attendanceDate}</div>
                                )}
                            </div>

                            {/* Batch Dropdown — loaded from DB */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Batch <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.batchId ? "is-invalid" : ""}`}
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
                                </select>
                                {errors.batchId && (
                                    <div className="invalid-feedback">{errors.batchId}</div>
                                )}
                            </div>

                            {/* Student Dropdown — loaded from DB */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Student <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.studentId ? "is-invalid" : ""}`}
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
                                </select>
                                {errors.studentId && (
                                    <div className="invalid-feedback">{errors.studentId}</div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Status <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.status ? "is-invalid" : ""}`}
                                    name="status"
                                    value={attendance.status}
                                    onChange={handleChange}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                </select>
                                {errors.status && (
                                    <div className="invalid-feedback">{errors.status}</div>
                                )}
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
                                    placeholder="Enter Remarks (optional)"
                                ></textarea>
                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Save Attendance"}
                                className="btn btn-primary"
                                disabled={isSaving}
                            />
                            <Button
                                type="button"
                                text="Reset"
                                className="btn btn-warning"
                                disabled={isSaving}
                                onClick={() => {
                                    setAttendance({ attendanceDate: "", batchId: "", batchName: "", studentId: "", studentName: "", status: "Present", remarks: "" });
                                    setErrors({});
                                    setApiError(null);
                                    setApiSuccess(null);
                                }}
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

export default MarkAttendance;