import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getBatches, deleteBatch } from "../../services/batchService";

function BatchList() {
    const [search, setSearch] = useState("");
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadBatches();
    }, []);

    async function loadBatches() {
        setLoading(true);
        setError(null);
        try {
            const data = await getBatches();
            setBatches(data);
        } catch (err) {
            console.log(err);
            setError("Failed to load batches.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this batch?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteBatch(id);
                setSuccess("Batch deleted successfully.");
                await loadBatches();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete batch.");
                setLoading(false);
            }
        }
    }

    const filteredBatches = batches.filter((batch) =>
        (batch.batchName && batch.batchName.toLowerCase().includes(search.toLowerCase())) ||
        (batch.batchCode && batch.batchCode.toLowerCase().includes(search.toLowerCase())) ||
        (batch.course && batch.course.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Batches Management"
                    subtitle="Manage batch schedules, instructors and class timings"
                />

                <Link
                    to="/batches/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-collection-play-fill me-1"></i> Add Batch
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by batch name, code or course..."
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
                        <Loader text="Loading batch schedules..." />
                    ) : filteredBatches.length === 0 ? (
                        <EmptyState
                            title="No Batches Found"
                            message={search ? `No batch records matching "${search}"` : "Click 'Add Batch' to schedule a new batch."}
                            icon="bi-collection"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Batch Code</th>
                                    <th>Batch Name</th>
                                    <th>Course</th>
                                    <th>Teacher</th>
                                    <th>Timing</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBatches.map((batch, index) => (
                                    <tr key={batch._id || index}>
                                        <td className="fw-semibold text-muted">{index + 1}</td>
                                        <td>
                                            <span className="badge bg-light text-dark font-monospace px-2 py-1 border">
                                                {batch.batchCode || `BAT-${index + 1}`}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-dark">
                                            {batch.batchName}
                                        </td>
                                        <td>
                                            <span className="badge badge-soft-info">
                                                {batch.course || "—"}
                                            </span>
                                        </td>
                                        <td>{batch.teacher || "—"}</td>
                                        <td>
                                            <small className="text-muted fw-medium">
                                                <i className="bi bi-clock me-1"></i>
                                                {batch.timing || "TBD"}
                                            </small>
                                        </td>
                                        <td>
                                            <span className={`badge ${batch.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                                {batch.status || "Active"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex gap-1">
                                                <Link
                                                    to={`/batches/view/${batch._id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View Details"
                                                >
                                                    <i className="bi bi-eye-fill"></i> View
                                                </Link>
                                                <Link
                                                    to={`/batches/edit/${batch._id}`}
                                                    className="btn btn-sm btn-outline-warning"
                                                    title="Edit Batch"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Edit
                                                </Link>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(batch._id)}
                                                    title="Delete Batch"
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

export default BatchList;