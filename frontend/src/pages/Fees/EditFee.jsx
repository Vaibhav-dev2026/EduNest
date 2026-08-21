import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { getFeeById, updateFee } from "../../services/feeService";
import { getStudents } from "../../services/studentService";

function EditFee() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [studentsList, setStudentsList] = useState([]);

    const [fee, setFee] = useState({
        receiptNo: "",
        student: "",
        studentId: "",
        studentName: "",
        course: "",
        batch: "",
        totalFee: "",
        paidFee: "",
        dueFee: 0,
        paymentDate: "",
        paymentMode: "Cash",
        transactionId: "",
        remarks: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadFeeAndDropdowns() {
            try {
                const [data, sData] = await Promise.all([
                    getFeeById(id),
                    getStudents().catch(() => [])
                ]);

                if (data) {
                    const total = Math.max(0, Number(data.totalFee) || 0);
                    const paid = Math.max(0, Number(data.paidFee) || 0);
                    const due = Math.max(0, total - paid);
                    setFee({ ...data, totalFee: total, paidFee: paid, dueFee: due });
                }
                setStudentsList(sData || []);
            } catch (error) {
                console.error("Error loading fee details:", error);
                setApiError("Failed to load fee record.");
            }
        }
        loadFeeAndDropdowns();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        let updatedFee = { ...fee, [name]: value };

        if (name === "student") {
            const selectedStudent = studentsList.find(
                s => s._id === value || s.studentId === value || `${s.firstName} ${s.lastName}` === value
            );

            if (selectedStudent) {
                const sName = `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim() || selectedStudent.studentName;
                const sCourse = selectedStudent.courseId || selectedStudent.courseName || selectedStudent.course || "";
                const sBatch = selectedStudent.batchId || selectedStudent.batchName || selectedStudent.batch || "";

                updatedFee.student = sName;
                updatedFee.studentName = sName;
                updatedFee.studentId = selectedStudent.studentId || selectedStudent._id;
                updatedFee.course = sCourse;
                updatedFee.batch = sBatch;
            }
        }

        const total = Math.max(0, Number(name === "totalFee" ? value : updatedFee.totalFee) || 0);
        const paid = Math.max(0, Number(name === "paidFee" ? value : updatedFee.paidFee) || 0);
        updatedFee.dueFee = Math.max(0, total - paid);

        setFee(updatedFee);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!fee.student || String(fee.student).trim() === "") {
            setApiError("Please select a student.");
            return;
        }

        setIsSaving(true);
        try {
            await updateFee(id, fee);
            setApiSuccess("Fee Collection Updated Successfully");
            setTimeout(() => {
                navigate("/fees");
            }, 1200);
        } catch (error) {
            console.error("Fee update error:", error);
            setApiError(error.message || "Failed to update fee collection.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Edit Fee Collection"
                subtitle="Update student fee payment details"
            />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Receipt No</label>
                                <Input
                                    type="text"
                                    name="receiptNo"
                                    value={fee.receiptNo || "Auto-generated"}
                                    readOnly={true}
                                    className="bg-light"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Select Student</label>
                                <select
                                    className="form-select"
                                    name="student"
                                    value={fee.studentId || fee.student}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Student</option>
                                    {studentsList.map((student) => (
                                        <option
                                            key={student._id}
                                            value={student.studentId || student._id}
                                        >
                                            {student.firstName} {student.lastName} ({student.studentId || "ID N/A"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course</label>
                                <Input
                                    type="text"
                                    name="course"
                                    value={fee.course}
                                    onChange={handleChange}
                                    readOnly={true}
                                    className="bg-light"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch</label>
                                <Input
                                    type="text"
                                    name="batch"
                                    value={fee.batch}
                                    onChange={handleChange}
                                    readOnly={true}
                                    className="bg-light"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Total Fee</label>
                                <Input
                                    type="number"
                                    name="totalFee"
                                    value={fee.totalFee}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Paid Fee</label>
                                <Input
                                    type="number"
                                    name="paidFee"
                                    value={fee.paidFee}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Due Fee</label>
                                <Input
                                    type="number"
                                    name="dueFee"
                                    value={fee.dueFee}
                                    readOnly={true}
                                    className="bg-light"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Payment Date</label>
                                <Input
                                    type="date"
                                    name="paymentDate"
                                    value={fee.paymentDate ? String(fee.paymentDate).split("T")[0] : ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Payment Mode</label>
                                <select
                                    className="form-select"
                                    name="paymentMode"
                                    value={fee.paymentMode}
                                    onChange={handleChange}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Transaction ID</label>
                                <Input
                                    type="text"
                                    name="transactionId"
                                    value={fee.transactionId}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-12 mb-3">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    name="remarks"
                                    value={fee.remarks}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="d-grid">
                            <Button
                                type="submit"
                                text={isSaving ? "Updating..." : "Update Fee Collection"}
                                className="btn btn-primary"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default EditFee;
