import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import SearchBox from "../../components/common/SearchBox";
import { getCurrentUser } from "../../services/authService";
import { getNotices, addNotice, updateNotice, deleteNotice } from "../../services/noticeService";
import { getBatches } from "../../services/batchService";
import { subscribeToEvents } from "../../services/socketService";

// A notice is visible to teachers if audience is "All", "All Teachers", "Teachers",
// created by this teacher, batch-specific, or is a legacy notice.
// Excludes "All Students"/"Students" only notices created by others.
function isNoticeForTeacher(notice, teacherName) {
    const audience = (notice.audience || "").trim().toLowerCase();
    const postedBy = (notice.postedBy || notice.createdBy || "").toLowerCase();
    if (teacherName && postedBy && postedBy === teacherName.toLowerCase()) return true;
    if (!audience || audience === "all" || audience === "all (students & teachers)") return true;
    if (audience === "all teachers" || audience === "teachers") return true;
    if (audience === "all students" || audience === "students") return false;
    return true; // batch-specific, etc.
}

const EMPTY_FORM = { title: "", description: "", priority: "Medium", date: "", audience: "All Students" };

function TeacherNotices() {
    const user = getCurrentUser() || {};
    const teacherName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Teacher";

    const [notices, setNotices] = useState([]);
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

    const loadNotices = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, batchesData] = await Promise.all([
                getNotices(),
                getBatches().catch(() => [])
            ]);
            const filtered = (data || []).filter(n => isNoticeForTeacher(n, teacherName));
            setNotices(filtered);
            setBatches(batchesData || []);
        } catch (err) {
            setError("Failed to load notices.");
        } finally {
            setLoading(false);
        }
    }, [teacherName]);

    useEffect(() => {
        loadNotices();

        const unsubscribe = subscribeToEvents([
            "notice:created", "notice:updated", "notice:deleted"
        ], () => {
            loadNotices();
        });

        return () => unsubscribe();
    }, [loadNotices]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function openAddForm() {
        setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
        setEditId(null);
        setFormError(null);
        setFormSuccess(null);
        setShowForm(true);
    }

    function openEditForm(notice) {
        setForm({
            title: notice.title || "",
            description: notice.description || "",
            priority: notice.priority || "Medium",
            date: notice.date ? String(notice.date).split("T")[0] : "",
            audience: notice.audience || "All Students",
        });
        setEditId(notice._id);
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
        if (!form.title.trim() || !form.description.trim()) {
            setFormError("Title and Description are required.");
            return;
        }
        setSaving(true);
        setFormError(null);
        setFormSuccess(null);
        try {
            const noticeData = {
                ...form,
                postedBy: teacherName,
                createdBy: teacherName,
                role: "teacher",
            };
            if (editId) {
                const updateData = { ...noticeData };
                delete updateData._id;
                await updateNotice(editId, updateData);
                setFormSuccess("Notice updated successfully!");
            } else {
                await addNotice(noticeData);
                setFormSuccess("Notice created successfully!");
            }
            await loadNotices();
            setTimeout(() => { setShowForm(false); setFormSuccess(null); }, 1200);
        } catch (err) {
            setFormError("Failed to save notice. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await deleteNotice(id);
            await loadNotices();
        } catch (err) {
            setError("Failed to delete notice.");
        }
    }

    const getPriorityBadge = (priority) => {
        if (priority === "High") return <span className="badge bg-danger">High</span>;
        if (priority === "Medium") return <span className="badge bg-warning text-dark">Medium</span>;
        return <span className="badge bg-info">Low</span>;
    };

    const getAudienceBadge = (audience) => {
        const a = (audience || "All").trim();
        if (a === "All Teachers" || a === "Teachers") return <span className="badge bg-primary">{a}</span>;
        if (a === "All Students" || a === "Students") return <span className="badge bg-success">{a}</span>;
        if (a === "All" || a === "All (Students & Teachers)") return <span className="badge bg-secondary">{a}</span>;
        return <span className="badge bg-info">{a}</span>;
    };

    const filtered = notices.filter(n => {
        const val = `${n.title || ""} ${n.description || ""}`.toLowerCase();
        return val.includes(search.toLowerCase());
    });

    return (
        <TeacherLayout>
            <PageHeader title="Notices" subtitle="Create and manage notices" />

            {/* Notice Form */}
            {showForm && (
                <div className="card shadow-sm border-0 mt-4 mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">
                            {editId ? "Edit Notice" : "Create New Notice"}
                        </h6>
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Title <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="Notice title" />
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Audience</label>
                                    <select className="form-select" name="audience" value={form.audience} onChange={handleChange}>
                                        <option value="All Students">All Students</option>
                                        <option value="All Teachers">All Teachers</option>
                                        <option value="All">All (Students &amp; Teachers)</option>
                                        {batches.map(b => (
                                            <option key={b._id} value={b.batchName || b.name}>{b.batchName || b.name} (Batch)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Description <span className="text-danger">*</span></label>
                                    <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleChange} placeholder="Enter notice details..."></textarea>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Saving..." : editId ? "Update Notice" : "Create Notice"}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notices Table */}
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <SearchBox value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or description..." />
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={loadNotices}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            {!showForm && (
                                <button className="btn btn-sm btn-primary" onClick={openAddForm}>
                                    <i className="bi bi-plus-lg me-1"></i> Create Notice
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? <Loader text="Loading notices..." /> : filtered.length === 0 ? (
                        <EmptyState title="No Notices Found" icon="bi-megaphone" />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Audience</th>
                                    <th>Priority</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((notice, idx) => (
                                    <tr key={notice._id || idx}>
                                        <td>{idx + 1}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>{notice.dateFormatted || notice.date || "—"}</td>
                                        <td className="fw-semibold text-primary">{notice.title}</td>
                                        <td style={{ maxWidth: "250px" }} className="text-truncate" title={notice.description}>
                                            {notice.description || "—"}
                                        </td>
                                        <td>{getAudienceBadge(notice.audience)}</td>
                                        <td>{getPriorityBadge(notice.priority)}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => openEditForm(notice)}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(notice._id)}>
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

export default TeacherNotices;
