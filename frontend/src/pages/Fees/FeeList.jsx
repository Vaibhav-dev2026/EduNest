import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import { getFees, deleteFee } from "../../services/feeService";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";
import { getBatches } from "../../services/batchService";
import { subscribeToEvents } from "../../services/socketService";

function FeeList() {
    const [search, setSearch] = useState("");
    const [fees, setFees] = useState([]);
    const [studentsMap, setStudentsMap] = useState({});
    const [coursesMap, setCoursesMap] = useState({});
    const [batchesMap, setBatchesMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadData();

        const unsubscribe = subscribeToEvents([
            "fees:created", "fees:updated", "fees:deleted"
        ], () => {
            loadData(true);
        });

        return () => unsubscribe();
    }, []);

    async function loadData(silent = false) {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const [feesData, sData, cData, bData] = await Promise.all([
                getFees().catch(() => []),
                getStudents().catch(() => []),
                getCourses().catch(() => []),
                getBatches().catch(() => [])
            ]);

            const sMap = {};
            (sData || []).forEach(s => {
                const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.studentName;
                if (s.studentId) sMap[s.studentId] = name;
                if (s._id) sMap[s._id] = name;
            });

            const cMap = {};
            (cData || []).forEach(c => {
                const name = c.courseName || c.name;
                if (c.courseId) cMap[c.courseId] = name;
                if (c._id) cMap[c._id] = name;
            });

            const bMap = {};
            (bData || []).forEach(b => {
                const name = b.batchName || b.name;
                if (b.batchId) bMap[b.batchId] = name;
                if (b._id) bMap[b._id] = name;
            });

            setStudentsMap(sMap);
            setCoursesMap(cMap);
            setBatchesMap(bMap);
            setFees(feesData || []);
        } catch (err) {
            console.log(err);
            setError("Failed to load fee records.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this fee record?")) {
            setLoading(true);
            setError(null);
            try {
                await deleteFee(id);
                setSuccess("Fee record deleted.");
                await loadData();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.log(err);
                setError("Failed to delete fee record.");
                setLoading(false);
            }
        }
    }

    const resolveStudentName = (fee) => {
        return fee.studentName || fee.student || studentsMap[fee.studentId] || "—";
    };

    const resolveCourseName = (fee) => {
        return coursesMap[fee.course] || coursesMap[fee.courseId] || fee.course || "General";
    };

    const resolveBatchName = (fee) => {
        return batchesMap[fee.batch] || batchesMap[fee.batchId] || fee.batch || "All Batches";
    };

    const filteredFees = fees.filter((fee) => {
        const studentStr = String(resolveStudentName(fee));
        const receiptNoStr = String(fee.receiptNo || "");
        const courseStr = String(resolveCourseName(fee));
        const searchLower = search.toLowerCase();
        return studentStr.toLowerCase().includes(searchLower) ||
               receiptNoStr.toLowerCase().includes(searchLower) ||
               courseStr.toLowerCase().includes(searchLower);
    });

    const getStatusBadge = (fee) => {
        const total = Math.max(0, Number(fee.totalFee) || 0);
        const paid = Math.max(0, Number(fee.paidFee) || 0);
        const due = Math.max(0, total - paid);

        let statusText = fee.status;
        if (!statusText) {
            if (due <= 0 && total > 0) statusText = "Paid";
            else if (paid > 0 && due > 0) statusText = "Partial";
            else statusText = "Pending";
        }

        if (statusText === "Paid") {
            return <span className="badge badge-soft-success"><i className="bi bi-check-circle-fill me-1"></i>Paid</span>;
        } else if (statusText === "Partial") {
            return <span className="badge badge-soft-warning"><i className="bi bi-pie-chart-fill me-1"></i>Partial</span>;
        } else {
            return <span className="badge badge-soft-danger"><i className="bi bi-exclamation-circle-fill me-1"></i>Pending</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <PageHeader
                    title="Fees Management"
                    subtitle="Track tuition fee collections, receipts and dues"
                />

                <Link
                    to="/fees/add"
                    className="btn btn-primary shadow-sm text-nowrap align-self-start align-self-sm-center"
                >
                    <i className="bi bi-cash-stack me-1"></i> Collect Fee
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="row mb-4">
                        <div className="col-12 col-md-5 col-lg-4">
                            <SearchBox
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by student, receipt, course..."
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
                        <Loader text="Loading fee receipts..." />
                    ) : filteredFees.length === 0 ? (
                        <EmptyState
                            title="No Fee Records"
                            message={search ? `No fee receipts matching "${search}"` : "Click 'Collect Fee' to issue a new receipt."}
                            icon="bi-receipt"
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <th>Receipt No</th>
                                    <th>Student</th>
                                    <th>Course / Batch</th>
                                    <th>Total Fee</th>
                                    <th>Paid Fee</th>
                                    <th>Due Fee</th>
                                    <th>Mode</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFees.map((fee, index) => {
                                    const studentName = resolveStudentName(fee);
                                    const courseName = resolveCourseName(fee);
                                    const batchName = resolveBatchName(fee);
                                    const total = Math.max(0, Number(fee.totalFee) || 0);
                                    const paid = Math.max(0, Number(fee.paidFee) || 0);
                                    const due = Math.max(0, total - paid);

                                    return (
                                        <tr key={fee._id || index}>
                                            <td>
                                                <span className="badge bg-light text-dark font-monospace px-2 py-1 border">
                                                    {fee.receiptNo || `RCPT-${index + 1}`}
                                                </span>
                                            </td>
                                            <td className="fw-semibold text-dark">
                                                {studentName}
                                            </td>
                                            <td>
                                                <div className="small fw-semibold">{courseName}</div>
                                                <div className="small text-muted">{batchName}</div>
                                            </td>
                                            <td>₹{total.toLocaleString('en-IN')}</td>
                                            <td className="fw-bold text-success">₹{paid.toLocaleString('en-IN')}</td>
                                            <td className={`fw-bold ${due > 0 ? "text-danger" : "text-muted"}`}>
                                                ₹{due.toLocaleString('en-IN')}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-secondary border">
                                                    {fee.paymentMode || "Cash"}
                                                </span>
                                            </td>
                                            <td>
                                                {getStatusBadge(fee)}
                                            </td>
                                            <td>
                                                <small className="text-muted">{fee.paymentDateFormatted || fee.paymentDate || "—"}</small>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-1">
                                                    <Link
                                                        to={`/fees/edit/${fee._id}`}
                                                        className="btn btn-sm btn-outline-warning"
                                                        title="Edit Fee"
                                                    >
                                                        <i className="bi bi-pencil-square"></i> Edit
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(fee._id)}
                                                        title="Delete Receipt"
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

export default FeeList;