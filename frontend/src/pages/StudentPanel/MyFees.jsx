import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getCurrentUser } from "../../services/authService";
import { getFees } from "../../services/feeService";
import { subscribeToEvents } from "../../services/socketService";

function MyFees() {
    const user = getCurrentUser() || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFees = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await getFees();
            const myFees = data.filter(record => {
                // Match by referenceId (studentId) OR full name from enriched studentName field
                const byId = record.studentId === user.referenceId;
                const byName = record.studentName && record.studentName.toLowerCase() === fullName.toLowerCase();
                const byStudent = record.student && record.student.toLowerCase() === fullName.toLowerCase();
                return byId || byName || byStudent;
            });
            setFees(myFees);
        } catch (err) {
            setError("Failed to load fee data.");
        } finally {
            setLoading(false);
        }
    }, [user.referenceId, fullName]);

    useEffect(() => {
        loadFees();

        const unsubscribe = subscribeToEvents([
            "fees:created", "fees:updated", "fees:deleted"
        ], () => {
            loadFees();
        });

        return () => unsubscribe();
    }, [loadFees]);

    return (
        <StudentLayout>
            <PageHeader title="My Fees" subtitle="View your fee payment history" />
            
            {loading && <Loader text="Loading fees..." />}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
            
            {!loading && !error && (
                <div className="card shadow-sm border-0 mt-4">
                    <div className="card-body p-4">
                        {fees.length === 0 ? (
                            <EmptyState title="No Fee Records" icon="bi-cash-stack" />
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Receipt No</th>
                                        <th>Course</th>
                                        <th>Total Fee</th>
                                        <th>Paid Fee</th>
                                        <th>Due Fee</th>
                                        <th>Payment Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fees.map((fee, idx) => (
                                        <tr key={fee._id || idx}>
                                            <td>{fee.receiptNo || "—"}</td>
                                            <td>{fee.course || "—"}</td>
                                            <td>₹{fee.totalFee || 0}</td>
                                            <td>₹{fee.paidFee || 0}</td>
                                            <td>₹{fee.dueFee || 0}</td>
                                            <td>{fee.paymentDateFormatted || fee.paymentDate || "—"}</td>
                                            <td>
                                                <span className={`badge ${Number(fee.dueFee) <= 0 ? 'bg-success' : 'bg-warning'}`}>
                                                    {Number(fee.dueFee) <= 0 ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
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

export default MyFees;
