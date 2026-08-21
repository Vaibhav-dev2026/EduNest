import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getNotices } from "../../services/noticeService";

function StudentNotices() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadNotices = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getNotices();
            setNotices(data);
        } catch (err) {
            setError("Failed to load notices.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotices();
    }, [loadNotices]);

    const getPriorityBadge = (priority) => {
        if (priority === "High") return <span className="badge bg-danger">High</span>;
        if (priority === "Medium") return <span className="badge bg-warning text-dark">Medium</span>;
        return <span className="badge bg-info">Low</span>;
    };

    return (
        <StudentLayout>
            <PageHeader title="Notices" subtitle="View latest announcements" />
            
            {loading && <Loader text="Loading notices..." />}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
            
            {!loading && !error && (
                <div className="card shadow-sm border-0 mt-4">
                    <div className="card-body p-4">
                        {notices.length === 0 ? (
                            <EmptyState title="No Notices" icon="bi-megaphone" />
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Description</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notices.map((notice, idx) => (
                                        <tr key={notice._id || idx}>
                                            <td style={{ whiteSpace: "nowrap" }}>{notice.dateFormatted || notice.date || "—"}</td>
                                            <td className="fw-medium text-primary">{notice.title}</td>
                                            <td>{notice.description || "—"}</td>
                                            <td>{getPriorityBadge(notice.priority)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}

export default StudentNotices;
