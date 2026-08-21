import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addStudent } from "../../services/studentService";

function AddStudent() {

    const navigate = useNavigate();

    const [student, setStudent] = useState({

        studentId: "",

        firstName: "",

        lastName: "",

        gender: "",

        dob: "",

        mobile: "",

        email: "",

        address: "",

        courseId: "",

        batchId: "",

        joiningDate: "",

        status: "Active"

    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setStudent((previous) => ({

            ...previous,

            [name]: value

        }));

    };

    function validateForm() {

        let validationErrors = {};

        if (student.firstName.trim() === "") {

            validationErrors.firstName = "First Name is required";

        }

        if (student.lastName.trim() === "") {

            validationErrors.lastName = "Last Name is required";

        }

        if (!/^[0-9]{10}$/.test(student.mobile)) {

            validationErrors.mobile = "Enter Valid Mobile Number";

        }

        if (

            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(student.email)

        ) {

            validationErrors.email = "Enter Valid Email";

        }

        if (student.courseId === "") {

            validationErrors.courseId = "Select Course";

        }

        if (student.batchId === "") {

            validationErrors.batchId = "Select Batch";

        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;

    }

    async function handleSubmit(event) {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        try {
            const result = await addStudent(student);
            const successMsg = result && result.loginCreated
                ? `Student Added Successfully. Login: ${student.email} / ${result.tempPassword} (share this with the student — they should change it after first login).`
                : "Student Added Successfully" + (result && result.loginNote ? `. ${result.loginNote}` : "");
            setApiSuccess(successMsg);
            setTimeout(() => navigate("/students"), result && result.loginCreated ? 4000 : 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Add Student");
            setIsSaving(false);
        }
    }

    return (
        <AdminLayout>
            <PageHeader
                title="Add Student"
                subtitle="Create New Student Record"
            />
            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>
        <div className="row">

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Student ID

                </label>

                <Input

                    type="text"

                    name="studentId"

                    value={student.studentId}

                    placeholder="Auto Generated (e.g. EDU001)"

                    readOnly

                />

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    First Name

                </label>

                <Input

                    type="text"

                    name="firstName"

                    value={student.firstName}

                    onChange={handleChange}

                    placeholder="Enter First Name"

                />

                {

                    errors.firstName &&

                    <small className="text-danger">

                        {errors.firstName}

                    </small>

                }

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Last Name

                </label>

                <Input

                    type="text"

                    name="lastName"

                    value={student.lastName}

                    onChange={handleChange}

                    placeholder="Enter Last Name"

                />

                {

                    errors.lastName &&

                    <small className="text-danger">

                        {errors.lastName}

                    </small>

                }

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Gender

                </label>

                <select

                    className="form-select"

                    name="gender"

                    value={student.gender}

                    onChange={handleChange}

                >

                    <option value="">Select Gender</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>

                    <option value="Other">Other</option>

                </select>

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Date Of Birth

                </label>

                <Input

                    type="date"

                    name="dob"

                    value={student.dob}

                    onChange={handleChange}

                />

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Mobile Number

                </label>

                <Input

                    type="text"

                    name="mobile"

                    value={student.mobile}

                    onChange={handleChange}

                    placeholder="Enter Mobile Number"

                />

                {

                    errors.mobile &&

                    <small className="text-danger">

                        {errors.mobile}

                    </small>

                }

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Email Address

                </label>

                <Input

                    type="email"

                    name="email"

                    value={student.email}

                    onChange={handleChange}

                    placeholder="Enter Email"

                />

                {

                    errors.email &&

                    <small className="text-danger">

                        {errors.email}

                    </small>

                }

            </div>

            <div className="col-12 mb-3">

                <label className="form-label">

                    Address

                </label>

                <textarea

                    className="form-control"

                    rows="3"

                    name="address"

                    value={student.address}

                    onChange={handleChange}

                ></textarea>

            </div>
            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Course

                </label>

                <select

                    className="form-select"

                    name="courseId"

                    value={student.courseId}

                    onChange={handleChange}

                >

                    <option value="">Select Course</option>

                    <option value="CRS001">MERN Stack</option>

                    <option value="CRS002">React JS</option>

                    <option value="CRS003">PHP</option>

                    <option value="CRS004">Java</option>

                    <option value="CRS005">Python</option>

                </select>

                {

                    errors.courseId &&

                    <small className="text-danger">

                        {errors.courseId}

                    </small>

                }

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Batch

                </label>

                <select

                    className="form-select"

                    name="batchId"

                    value={student.batchId}

                    onChange={handleChange}

                >

                    <option value="">Select Batch</option>

                    <option value="BAT001">Morning</option>

                    <option value="BAT002">Evening</option>

                    <option value="BAT003">Weekend</option>

                </select>

                {

                    errors.batchId &&

                    <small className="text-danger">

                        {errors.batchId}

                    </small>

                }

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Joining Date

                </label>

                <Input

                    type="date"

                    name="joiningDate"

                    value={student.joiningDate}

                    onChange={handleChange}

                />

            </div>

            <div className="col-md-6 mb-3">

                <label className="form-label">

                    Status

                </label>

                <select

                    className="form-select"

                    name="status"

                    value={student.status}

                    onChange={handleChange}

                >

                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>

                </select>

            </div>

        </div>

        <div className="mt-4">

            <Button
                type="submit"
                className="btn btn-primary me-2"
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save Student"}
            </Button>

            <Button

                type="button"

                className="btn btn-secondary"

                onClick={() => navigate("/students")}
                disabled={isSaving}
            >
                Cancel
            </Button>

        </div>

    </form>

        </div >

    </div >

</AdminLayout >

);

}

export default AddStudent;