import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

import { getBatchById } from "../../services/batchService";

function ViewBatch() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBatch() {
            setLoading(true);
            try {
                const data = await getBatchById(id);
                setBatch(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }
        loadBatch();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <Loader text="Fetching batch information..." />
            </AdminLayout>
        );
    }

    if (!batch) {
        return (
            <AdminLayout>
                <div className="alert alert-danger my-4">
                    Batch record not found.
                </div>
                <Button className="btn btn-secondary" onClick={() => navigate("/batches")}>
                    Back to Batches
                </Button>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <PageHeader title="Batch Information" subtitle={`Viewing batch schedule for ${batch.batchName}`} />
                <Button className="btn btn-outline-secondary" onClick={() => navigate("/batches")}>
                    <i className="bi bi-arrow-left me-1"></i> Back to Batches
                </Button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row g-4 align-items-start">
                        
                        {/* Batch Icon Column */}
                        <div className="col-12 col-md-4 col-lg-3 text-center border-end border-light">
                            <div className="bg-info bg-opacity-10 text-info rounded-4 d-inline-flex align-items-center justify-content-center fw-bold fs-1 mb-3 shadow-sm" style={{ width: "120px", height: "120px" }}>
                                <i className="bi bi-collection-fill"></i>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">
                                {batch.batchName}
                            </h5>
                            <span className="badge bg-light text-secondary font-monospace px-3 py-1.5 border mb-3">
                                {batch.batchCode || `BAT-${batch._id?.slice(-6)}`}
                            </span>
                            <div>
                                <span className={`badge ${batch.status === "Inactive" ? "badge-soft-danger" : "badge-soft-success"}`}>
                                    <i className={`bi ${batch.status === "Inactive" ? "bi-x-circle-fill" : "bi-check-circle-fill"} me-1`}></i>
                                    {batch.status || "Active Batch"}
                                </span>
                            </div>

                            <div className="d-grid gap-2 mt-4">
                                <Link to={`/batches/edit/${batch._id}`} className="btn btn-warning">
                                    <i className="bi bi-pencil-square me-1"></i> Edit Batch
                                </Link>
                            </div>
                        </div>

                        {/* Details Table Column */}
                        <div className="col-12 col-md-8 col-lg-9">
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                <i className="bi bi-clock-history text-primary me-2"></i> Timings, Capacity & Location
                            </h6>

                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="30%" className="text-muted fw-semibold">Batch Code</th>
                                            <td className="font-monospace fw-bold">{batch.batchCode}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Batch Name</th>
                                            <td className="fw-semibold text-dark">{batch.batchName}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Associated Course</th>
                                            <td>
                                                <span className="badge badge-soft-info">{batch.course || "—"}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Assigned Teacher</th>
                                            <td>{batch.teacher || "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Class Timing</th>
                                            <td className="fw-semibold text-dark">
                                                <i className="bi bi-clock me-1 text-primary"></i>
                                                {batch.timing || "—"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Classroom / Room No</th>
                                            <td>{batch.room ? `Room ${batch.room}` : "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Start & End Date</th>
                                            <td>{batch.startDate} to {batch.endDate || "Ongoing"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Maximum Students</th>
                                            <td>{batch.maxStudents ? `${batch.maxStudents} Capacity` : "—"}</td>
                                        </tr>
                                        <tr>
                                            <th className="text-muted fw-semibold">Batch Description</th>
                                            <td>{batch.description || "—"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default ViewBatch;
