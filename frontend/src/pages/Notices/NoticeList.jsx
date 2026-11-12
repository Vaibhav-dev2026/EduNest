import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getNotices, deleteNotice } from "../../services/noticeService";
import { subscribeToEvents } from "../../services/socketService";

function NoticeList() {
    const [search, setSearch] = useState("");
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadNotices();

        const unsubscribe = subscribeToEvents([
            "notice:created", "notice:updated", "notice:deleted"
        ], () => {
            loadNotices(true);
        });

        return () => unsubscribe();
    }, []);

    async function loadNotices(silent = false) {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await getNotices();
            setNotices(data);
        } catch (err) {
            console.log(err);
            if (!silent) setError("Failed to load notices.");
        } finally {
            if (!silent) setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteNotice(id);
                setSuccess("Notice deleted.");
                await loadNotices();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete notice.");
                setLoading(false);
            }
        }
    }

    const filteredNotices = notices.filter((notice) =>
        (notice.title && notice.title.toLowerCase().includes(search.toLowerCase())) ||
        (notice.audience && notice.audience.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Institute Notice Board"
                    subtitle="Publish announcements, exam alerts and holiday updates"
                />

                <Link
                    to="/notices/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-bell-fill me-1"></i> Add Notice
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by title or audience..."
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
                        <Loader text="Loading notice board..." />
                    ) : filteredNotices.length === 0 ? (
                        <EmptyState
                            title="No Notices Found"
                            message={search ? `No notices matching "${search}"` : "Click 'Add Notice' to broadcast a new announcement."}
                            icon="bi-megaphone"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Notice Title</th>
                                    <th>Target Audience</th>
                                    <th>Publish Date</th>
                                    <th>Expiry Date</th>
                                    <th>Priority</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNotices.map((notice, index) => (
                                    <tr key={notice._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td className="fw-semibold text-dark">
                                            <i className="bi bi-card-heading text-primary me-2"></i>
                                            {notice.title}
                                        </td>
                                        <td>
                                            <span className="badge badge-soft-info">
                                                {notice.audience || "All"}
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {notice.publishDate || notice.dateFormatted || notice.date || "—"}
                                            </small>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {notice.expiryDate || "—"}
                                            </small>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    notice.priority === "High"
                                                        ? "badge-soft-danger"
                                                        : notice.priority === "Medium"
                                                        ? "badge-soft-warning"
                                                        : "badge-soft-success"
                                                }`}
                                            >
                                                {notice.priority || "Medium"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/notices/edit/${notice._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Notice"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(notice._id)}
                                                    title="Delete Announcement"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
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
        </AdminLayout>
    );
}

export default NoticeList;