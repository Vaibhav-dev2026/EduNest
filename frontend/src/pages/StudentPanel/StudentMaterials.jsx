import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getMaterials, getFileUrl } from "../../services/materialService";

function StudentMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMaterials = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMaterials();
            setMaterials((data || []).filter(m => m.status !== 'Inactive'));
        } catch (err) {
            setError("Failed to load materials.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMaterials();
    }, [loadMaterials]);

    const resolveTeacherName = (item) => {
        return item.uploadedBy || item.teacherName || item.teacher || "Not Available";
    };

    const resolveCourseName = (item) => {
        return item.courseName || item.course || "Not Available";
    };

    const resolveBatchName = (item) => {
        return item.batchName || item.batch || "Not Available";
    };

    const formatDate = (dateStr, formattedFallback) => {
        if (formattedFallback && formattedFallback !== "Not Available") return formattedFallback;
        if (!dateStr) return "Not Available";
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    };

    return (
        <StudentLayout>
            <PageHeader title="Study Materials" subtitle="Access course resources and notes" />
            
            {loading && <Loader text="Loading study materials..." />}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
            
            {!loading && !error && (
                <div className="card shadow-sm border-0 mt-4">
                    <div className="card-body p-4">
                        {materials.length === 0 ? (
                            <EmptyState title="No Study Materials" icon="bi-file-earmark-text" />
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Subject</th>
                                        <th>Course</th>
                                        <th>Batch</th>
                                        <th>Uploaded By</th>
                                        <th>Type</th>
                                        <th>Upload Date</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map((item, idx) => {
                                        const teacherName = resolveTeacherName(item);
                                        const courseName = resolveCourseName(item);
                                        const batchName = resolveBatchName(item);
                                        const matType = item.materialType || item.type || "Not Available";
                                        return (
                                            <tr key={item._id || idx}>
                                                <td className="fw-medium text-dark">{item.title || "Not Available"}</td>
                                                <td>{item.subject || "Not Available"}</td>
                                                <td>{courseName}</td>
                                                <td>{batchName}</td>
                                                <td className="fw-medium">{teacherName}</td>
                                                <td>
                                                    <span className="badge bg-secondary">{matType}</span>
                                                </td>
                                                <td>{formatDate(item.uploadDate || item.date, item.uploadDateFormatted)}</td>
                                                <td style={{ maxWidth: "200px" }} className="text-truncate" title={item.description || ""}>
                                                    {item.description || "Not Available"}
                                                </td>
                                                <td>
                                                    {item.fileUrl && !item.fileUrl.startsWith("C:\\") ? (
                                                        <a
                                                            href={getFileUrl(item.fileUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            download={item.fileName || true}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            <i className="bi bi-download me-1"></i> Download
                                                        </a>
                                                    ) : (
                                                        <span className="badge bg-light text-muted">File Not Available</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}

export default StudentMaterials;
