import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import SearchBox from "../../components/common/SearchBox";
import { getCurrentUser } from "../../services/authService";
import { getMaterials, addMaterial, deleteMaterial, downloadMaterialFile, getFileUrl } from "../../services/materialService";
import { getCourses } from "../../services/courseService";
import { getBatches } from "../../services/batchService";
import { subscribeToEvents } from "../../services/socketService";

const EMPTY_FORM = {
    title: "",
    subject: "",
    courseId: "",
    batchId: "",
    materialType: "PDF",
    description: "",
    file: null,
    uploadDate: ""
};

function TeacherMaterials() {
    const user = getCurrentUser() || {};
    const teacherName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName || user.name || user.email || "Teacher";
    const teacherId = user.referenceId || user.teacherId || user._id || "";

    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [downloadError, setDownloadError] = useState(null);

    const loadMaterials = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [materialsData, coursesData, batchesData] = await Promise.all([
                getMaterials(),
                getCourses().catch(() => []),
                getBatches().catch(() => [])
            ]);
            setMaterials(materialsData || []);
            setCourses(coursesData || []);
            setBatches(batchesData || []);
        } catch (err) {
            setError("Failed to load study materials.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMaterials();

        const unsubscribe = subscribeToEvents([
            "material:created", "material:deleted"
        ], () => {
            loadMaterials();
        });

        return () => unsubscribe();
    }, [loadMaterials]);

    function handleChange(e) {
        const { name, value, files } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    }

    function openAddForm() {
        setForm({ ...EMPTY_FORM, uploadDate: new Date().toISOString().split("T")[0] });
        setFormError(null);
        setFormSuccess(null);
        setShowForm(true);
    }

    function cancelForm() {
        setShowForm(false);
        setForm(EMPTY_FORM);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title.trim() || !form.subject.trim()) {
            setFormError("Title and Subject are required.");
            return;
        }
        if (!form.file) {
            setFormError("Please select a file to upload.");
            return;
        }

        setSaving(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const selectedCourse = courses.find(c => c.courseCode === form.courseId || c._id === form.courseId);
            const selectedBatch = batches.find(b => b.batchCode === form.batchId || b._id === form.batchId);

            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("subject", form.subject);
            formData.append("courseId", form.courseId);
            if (selectedCourse) formData.append("courseName", selectedCourse.courseName || selectedCourse.name || "");
            formData.append("batchId", form.batchId);
            if (selectedBatch) formData.append("batchName", selectedBatch.batchName || selectedBatch.name || "");
            formData.append("materialType", form.materialType);
            formData.append("teacherId", teacherId);
            formData.append("uploadedBy", teacherName);
            if (form.uploadDate) formData.append("uploadDate", form.uploadDate);
            if (form.description) formData.append("description", form.description);
            if (form.file) formData.append("file", form.file);

            await addMaterial(formData);
            setFormSuccess("Material uploaded successfully!");
            await loadMaterials();
            setTimeout(() => {
                setShowForm(false);
                setFormSuccess(null);
            }, 1200);
        } catch (err) {
            setFormError(err.message || "Failed to upload material. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        try {
            await deleteMaterial(id);
            await loadMaterials();
        } catch (err) {
            setError("Failed to delete material.");
        }
    }

    async function handleDownload(item) {
        setDownloading(item._id);
        setDownloadError(null);
        try {
            await downloadMaterialFile(item._id, item.fileName || item.title || "download");
        } catch (err) {
            setDownloadError(err.message || "Download failed. Please try again.");
        } finally {
            setDownloading(null);
        }
    }

    const filtered = materials.filter(m => {
        const val = `${m.title || ""} ${m.subject || ""} ${m.uploadedBy || m.teacher || ""} ${m.courseName || m.course || ""} ${m.batchName || m.batch || ""}`.toLowerCase();
        return val.includes(search.toLowerCase());
    });

    const formatDate = (dateStr, formattedFallback) => {
        if (formattedFallback && formattedFallback !== "Not Available") return formattedFallback;
        if (!dateStr) return "Not Available";
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    return (
        <TeacherLayout>
            <PageHeader title="Study Materials" subtitle="Upload and manage study resources" />

            {/* Upload Form */}
            {showForm && (
                <div className="card shadow-sm border-0 mt-4 mb-4">
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-3 border-bottom pb-2">Upload New Material</h6>
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Title <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Introduction to React" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Subject <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. React JS" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Course</label>
                                    <select className="form-select" name="courseId" value={form.courseId} onChange={handleChange}>
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                             <option key={c._id} value={c.courseCode || c._id}>{c.courseName || c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Batch</label>
                                    <select className="form-select" name="batchId" value={form.batchId} onChange={handleChange}>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b._id} value={b.batchCode || b._id}>{b.batchName || b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Material Type</label>
                                    <select className="form-select" name="materialType" value={form.materialType} onChange={handleChange}>
                                        <option value="PDF">PDF</option>
                                        <option value="DOCX">DOCX</option>
                                        <option value="PPT">PPT</option>
                                        <option value="ZIP">ZIP</option>
                                        <option value="Document">Document</option>
                                        <option value="Video">Video</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Upload Date</label>
                                    <input type="date" className="form-control" name="uploadDate" value={form.uploadDate} onChange={handleChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Choose File <span className="text-danger">*</span></label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Uploader</label>
                                    <input type="text" className="form-control" value={teacherName} disabled />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the material"></textarea>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Uploading..." : "Upload Material"}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Materials Table */}
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <SearchBox value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or subject..." />
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary" onClick={loadMaterials}>
                                <i className="bi bi-arrow-clockwise"></i>
                            </button>
                            {!showForm && (
                                <button className="btn btn-sm btn-primary" onClick={openAddForm}>
                                    <i className="bi bi-upload me-1"></i> Upload Material
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {downloadError && <div className="alert alert-warning d-flex justify-content-between align-items-center">
                        <span><i className="bi bi-exclamation-triangle me-2"></i>{downloadError}</span>
                        <button className="btn-close" onClick={() => setDownloadError(null)}></button>
                    </div>}

                    {loading ? <Loader text="Loading materials..." /> : filtered.length === 0 ? (
                        <EmptyState title="No Study Materials" icon="bi-file-earmark-text" />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Type</th>
                                    <th>Uploaded By</th>
                                    <th>Upload Date</th>
                                    <th>File</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, idx) => {
                                    const fileUrl = item.fileUrl ? getFileUrl(item.fileUrl) : (item.link ? item.link : "");
                                    const hasValidFile = Boolean(item._id && fileUrl && !fileUrl.endsWith("/") && !item.fileUrl?.startsWith("C:\\"));
                                    return (
                                        <tr key={item._id || idx}>
                                            <td>{idx + 1}</td>
                                            <td className="fw-semibold">{item.title || "Not Available"}</td>
                                            <td>{item.subject || "Not Available"}</td>
                                            <td>{item.courseName || item.course || "Not Available"}</td>
                                            <td>{item.batchName || item.batch || "Not Available"}</td>
                                            <td>{item.materialType || "Not Available"}</td>
                                            <td>{item.uploadedBy || item.teacherName || item.teacher || "Not Available"}</td>
                                            <td>{formatDate(item.uploadDate || item.date, item.uploadDateFormatted)}</td>
                                            <td>
                                                {hasValidFile ? (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleDownload(item)}
                                                        disabled={downloading === item._id}
                                                    >
                                                        {downloading === item._id ? (
                                                            <><i className="bi bi-hourglass-split me-1"></i>Downloading...</>
                                                        ) : (
                                                            <><i className="bi bi-download me-1"></i>Download</>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="badge bg-light text-muted">File Not Available</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete Material"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>

            </div>
        </TeacherLayout>
    );
}

export default TeacherMaterials;
