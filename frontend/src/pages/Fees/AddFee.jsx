import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addFee } from "../../services/feeService";
import { getStudents } from "../../services/studentService";
import { getCourses } from "../../services/courseService";

function AddFee() {

    const navigate = useNavigate();

    const [studentsList, setStudentsList] = useState([]);
    const [coursesList, setCoursesList] = useState([]);

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

        paymentDate: new Date().toISOString().split("T")[0],

        paymentMode: "Cash",

        transactionId: "",

        remarks: ""

    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        loadDropdownData();
    }, []);

    async function loadDropdownData() {
        try {
            const [sData, cData] = await Promise.all([
                getStudents().catch(() => []),
                getCourses().catch(() => [])
            ]);
            setStudentsList(sData || []);
            setCoursesList(cData || []);
        } catch (err) {
            console.error("Error loading dropdown data:", err);
        }
    }

    const handleChange = (event) => {

        const { name, value } = event.target;

        let updatedFee = {

            ...fee,

            [name]: value

        };

        // When student is selected, auto populate details
        if (name === "student") {
            const selectedStudent = studentsList.find(
                s => s._id === value || s.studentId === value || `${s.firstName} ${s.lastName}` === value
            );

            if (selectedStudent) {
                const sName = `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim() || selectedStudent.studentName;
                const sCourse = selectedStudent.courseName || selectedStudent.course || "";
                const sBatch = selectedStudent.batchName || selectedStudent.batch || "";

                // Find matching course fee
                const matchingCourse = coursesList.find(c =>
                    (c.courseName || c.name) === sCourse || c._id === sCourse
                );
                const defaultFee = matchingCourse ? (matchingCourse.fees || matchingCourse.fee || matchingCourse.totalFee || "") : "";

                updatedFee.student = sName;
                updatedFee.studentName = sName;
                updatedFee.studentId = selectedStudent.studentId || selectedStudent._id;
                updatedFee.course = sCourse;
                updatedFee.batch = sBatch;
                if (defaultFee && !updatedFee.totalFee) {
                    updatedFee.totalFee = defaultFee;
                }
            }
        }

        const total = Math.max(0, Number(name === "totalFee" ? value : updatedFee.totalFee) || 0);
        const paid = Math.max(0, Number(name === "paidFee" ? value : updatedFee.paidFee) || 0);
        updatedFee.dueFee = Math.max(0, total - paid);

        setFee(updatedFee);

    };

    function validateForm() {

        let validationErrors = {};

        if (fee.student.trim() === "") {

            validationErrors.student = "Please Select Student";

        }

        if (String(fee.totalFee).trim() === "") {

            validationErrors.totalFee = "Total Fee is required";

        }

        if (String(fee.paidFee).trim() === "") {

            validationErrors.paidFee = "Paid Fee is required";

        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;

    }

    async function handleSubmit(event) {

        event.preventDefault();

        if (!validateForm()) {

            return;

        }

        setIsSaving(true);
        setApiError(null);
        setApiSuccess(null);

        try {

            await addFee(fee);

            setApiSuccess("Fee Collection Added Successfully");

            setTimeout(() => {

                navigate("/fees");

            }, 1200);

        }

        catch (error) {

            console.error("Fee addition error:", error);
            setApiError(error.message || "Failed to add fee collection.");

        }

        finally {

            setIsSaving(false);

        }

    }

    return (

        <AdminLayout>

            <PageHeader

                title="Add Fee Collection"

                subtitle="Record student fee payments"

            />

            <div className="card shadow-sm">

                <div className="card-body">

                    {

                        apiError &&

                        <div className="alert alert-danger">

                            {apiError}

                        </div>

                    }

                    {

                        apiSuccess &&

                        <div className="alert alert-success">

                            {apiSuccess}

                        </div>

                    }

                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Select Student

                                </label>

                                <select

                                    className="form-select"

                                    name="student"

                                    value={fee.studentId || fee.student}

                                    onChange={handleChange}

                                >

                                    <option value="">

                                        Select Student

                                    </option>

                                    {

                                        studentsList.map((student) => (

                                            <option

                                                key={student._id}

                                                value={student.studentId || student._id}

                                            >

                                                {student.firstName} {student.lastName} ({student.studentId || "ID N/A"})

                                            </option>

                                        ))

                                    }

                                </select>

                                {

                                    errors.student &&

                                    <small className="text-danger">

                                        {errors.student}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Course

                                </label>

                                <Input

                                    type="text"

                                    name="course"

                                    value={fee.course}

                                    onChange={handleChange}

                                    placeholder="Auto-populated with student's course"

                                    readOnly={true}

                                    className="bg-light"

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Batch

                                </label>

                                <Input

                                    type="text"

                                    name="batch"

                                    value={fee.batch}

                                    onChange={handleChange}

                                    placeholder="Auto-populated with student's batch"

                                    readOnly={true}

                                    className="bg-light"

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Total Fee

                                </label>

                                <Input

                                    type="number"

                                    name="totalFee"

                                    value={fee.totalFee}

                                    onChange={handleChange}

                                    placeholder="Enter Total Fee"

                                />

                                {

                                    errors.totalFee &&

                                    <small className="text-danger">

                                        {errors.totalFee}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Paid Fee

                                </label>

                                <Input

                                    type="number"

                                    name="paidFee"

                                    value={fee.paidFee}

                                    onChange={handleChange}

                                    placeholder="Enter Paid Fee"

                                />

                                {

                                    errors.paidFee &&

                                    <small className="text-danger">

                                        {errors.paidFee}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Due Fee

                                </label>

                                <Input

                                    type="number"

                                    name="dueFee"

                                    value={fee.dueFee}

                                    readOnly={true}

                                    className="bg-light"

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Payment Date

                                </label>

                                <Input

                                    type="date"

                                    name="paymentDate"

                                    value={fee.paymentDate}

                                    onChange={handleChange}

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Payment Mode

                                </label>

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

                                <label className="form-label">

                                    Transaction ID

                                </label>

                                <Input

                                    type="text"

                                    name="transactionId"

                                    value={fee.transactionId}

                                    onChange={handleChange}

                                    placeholder="Optional transaction reference"

                                />

                            </div>

                            <div className="col-12 mb-3">

                                <label className="form-label">

                                    Remarks

                                </label>

                                <textarea

                                    className="form-control"

                                    rows="3"

                                    name="remarks"

                                    value={fee.remarks}

                                    onChange={handleChange}

                                    placeholder="Optional remarks or notes"

                                />

                            </div>

                        </div>

                        <div className="d-grid">

                            <Button

                                type="submit"

                                text={

                                    isSaving

                                        ? "Saving..."

                                        : "Save Fee Collection"

                                }

                                className="btn btn-primary"

                            />

                        </div>

                    </form>

                </div>

            </div>

        </AdminLayout>

    );

}

export default AddFee;