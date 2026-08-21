import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import SearchBox from "../../components/common/SearchBox";
import { getAttendance, addAttendance, updateAttendance, deleteAttendance } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getBatches } from "../../services/batchService";
import { getCurrentUser } from "../../services/authService";

const EMPTY_FORM = { attendanceDate: "", batchId: "", batchName: "", studentId: "", studentName: "", status: "Present", remarks: "" };

function TeacherAttendance() {
    const [records, setRecords] = useState([]);
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [attendanceData, studentsData, batchesData] = await Promise.all([
                getAttendance(), 
                getStudents(),
                getBatches().catch(() => [])
            ]);
            setRecords(attendanceData);
            setStudents(studentsData);
            setBatches(batchesData);
        } catch (err) {
            setError("Failed to load attendance data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function openAddForm() {
        setForm(EMPTY_FORM);
        setEditId(null);
        setFormError(null);
        setFormSuccess(null);
        setShowForm(true);
    }

    function openEditForm(record) {
        setForm({ ...record });
        setEditId(record._id);
        setFormError(null);
        setFormSuccess(null);
        setShowForm(true);
    }

    function cancelForm() {
        setShowForm(false);
        setForm(EMPTY_FORM);
        setEditId(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.attendanceDate || !form.studentId || !form.status) {
            setFormError("Date, Student, and Status are required.");
            return;
        }
        setSaving(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const user = getCurrentUser() || {};

            const selectedStudent = students.find(s => s.studentId === form.studentId || s._id === form.studentId);
            const selectedBatch = batches.find(b => (b.batchCode || b._id) === form.batchId);
            
            const payload = {
                ...form,
                studentId: form.studentId,
                studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : (form.studentName || form.student),
                batchId: form.batchId,
                batchName: selectedBatch ? selectedBatch.batchName : (form.batchName || form.batch),
                teacherId: user.teacherId || user._id || "TCH_UNKNOWN",
                teacherName: user.fullName || "Unknown Teacher"
            };

            if (editId) {
                const updateData = { ...payload };
                delete updateData._id;
                await updateAttendance(editId, updateData);
                setFormSuccess("Attendance updated successfully!");
            } else {
                await addAttendance(payload);
                setFormSuccess("Attendance marked successfully!");
            }
            await loadData();
            setTimeout(() => { setShowForm(false); setFormSuccess(null); }, 1200);
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || "Failed to save attendance. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
        try {
            await deleteAttendance(id);
            await loadData();
        } catch (err) {
            setError("Failed to delete attendance record.");
        }
    }

    const filtered = records.filter(r => {
        const val = `${r.studentName || r.student || ""} ${r.batchName || r.batch || ""} ${r.attendanceDate || ""}`.toLowerCase();
        return val.includes(search.toLowerCase());
    });

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    return (
        <TeacherLayout>
            <PageHeader title="Attendance" subtitle="Mark and manage student attendance" />

            {/* Mark Attendance Form */}
            {showForm && (
                <div className="card shadow-sm border-0 mt-4 mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">
                            {editId ? "Edit Attendance Record" : "Mark Attendance"}
                        </h6>
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Attendance Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" name="attendanceDate" value={form.attendanceDate} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Batch</label>
                                    <select className="form-select" name="batchId" value={form.batchId || ""} onChange={handleChange}>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b._id} value={b.batchCode || b._id}>
                                                {b.batchName} ({b.batchCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Student <span className="text-danger">*</span></label>
                                    <select className="form-select" name="studentId" value={form.studentId || ""} onChange={handleChange}>
                                        <option value="">Select Student</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s.studentId || s._id}>
                                                {s.firstName} {s.lastName} ({s.studentId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Status <span className="text-danger">*</span></label>
                                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Leave">Leave</option>
                                    </select>
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Remarks</label>
                                    <textarea className="form-control" rows="2" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Optional remarks"></textarea>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Saving..." : editId ? "Update" : "Mark Attendance"}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Table */}
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <SearchBox value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, batch or date..." />
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={loadData}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            {!showForm && (
                                <button className="btn btn-sm btn-primary" onClick={openAddForm}>
                                    <i className="bi bi-plus-lg me-1"></i> Mark Attendance
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? <Loader text="Loading attendance..." /> : filtered.length === 0 ? (
                        <EmptyState title="No Attendance Records" icon="bi-calendar-x" />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Batch</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((record, idx) => (
                                    <tr key={record._id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{formatDate(record.attendanceDate)}</td>
                                        <td className="fw-semibold">{record.studentName || record.student || "—"}</td>
                                        <td>{record.batchName || record.batch || "—"}</td>
                                        <td>
                                            <span className={`badge ${record.status === "Present" ? "bg-success" : record.status === "Absent" ? "bg-danger" : "bg-warning text-dark"}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>{record.remarks || "—"}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => openEditForm(record)}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record._id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}

export default TeacherAttendance;
