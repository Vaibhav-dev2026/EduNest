import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getMaterials, deleteMaterial, getFileUrl } from "../../services/materialService";

function MaterialList() {
    const [search, setSearch] = useState("");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // The backend now returns fully-resolved, readable fields for every
    // material (uploadedBy, courseName, batchName, uploadDateFormatted),
    // so the frontend no longer needs to fetch teachers/courses/batches
    // separately or build its own ID → name lookup maps.
    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const materialsData = await getMaterials();
            setMaterials(materialsData || []);
        } catch (err) {
            console.log(err);
            setError("Failed to load materials.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this study material?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteMaterial(id);
                setSuccess("Material deleted.");
                await loadData();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete material.");
                setLoading(false);
            }
        }
    }

    const filteredMaterials = materials.filter((item) => {
        const titleStr = String(item.title || "");
        const courseStr = String(item.courseName || "");
        const batchStr = String(item.batchName || "");
        const teacherStr = String(item.uploadedBy || "");
        const subjectStr = String(item.subject || "");
        const searchLower = search.toLowerCase();
        return titleStr.toLowerCase().includes(searchLower) ||
               courseStr.toLowerCase().includes(searchLower) ||
               batchStr.toLowerCase().includes(searchLower) ||
               teacherStr.toLowerCase().includes(searchLower) ||
               subjectStr.toLowerCase().includes(searchLower);
    });

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Study Materials Repository"
                    subtitle="Share notes, assignments and reference files with students"
                />

                <Link
                    to="/materials/upload"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-cloud-upload-fill me-1"></i> Upload Material
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by title, subject, course, teacher..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>{error}</div>
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-check-circle-fill"></i>
                            <div>{success}</div>
                        </div>
                    )}

                    {loading ? (
                        <Loader text="Loading study resources..." />
                    ) : filteredMaterials.length === 0 ? (
                        <EmptyState
                            title="No Materials Uploaded"
                            message={search ? `No materials matching "${search}"` : "Click 'Upload Material' to share study documents."}
                            icon="bi-file-earmark-arrow-up"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Uploaded By / Teacher</th>
                                    <th>Type</th>
                                    <th>Upload Date</th>
                                    <th>Description</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMaterials.map((item, index) => {
                                    const matType = item.materialType || "Not Available";
                                    return (
                                        <tr key={item._id || index}>
                                            <td className="fw-semibold text-muted">{index + 1}</td>
                                            <td className="fw-semibold text-dark">
                                                <i className="bi bi-file-earmark-text text-primary me-2"></i>
                                                {item.title || "Untitled"}
                                            </td>
                                            <td>{item.subject || "Not Available"}</td>
                                            <td>{item.courseName || "Not Available"}</td>
                                            <td>
                                                <span className="badge badge-soft-info">
                                                    {item.batchName || "Not Available"}
                                                </span>
                                            </td>
                                            <td className="fw-medium text-dark">{item.uploadedBy || "Not Available"}</td>
                                            <td>
                                                <span className={`badge ${matType === "PDF" ? "badge-soft-danger" : matType === "ZIP" ? "badge-soft-warning" : "badge-soft-primary"}`}>
                                                    {matType}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {item.uploadDateFormatted || "Not Available"}
                                                </small>
                                            </td>
                                            <td style={{ maxWidth: "200px" }} className="text-truncate" title={item.description || ""}>
                                                {item.description || "Not Available"}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-1">
                                                    {item.fileUrl && !item.fileUrl.startsWith("C:\\") ? (
                                                        <a
                                                            href={getFileUrl(item.fileUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            download={item.fileName || true}
                                                            className="btn btn-sm btn-outline-success"
                                                            title="Download Material"
                                                        >
                                                            <i className="bi bi-download"></i> Download
                                                        </a>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            disabled
                                                        >
                                                            File Not Available
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(item._id)}
                                                        title="Delete Resource"
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default MaterialList;