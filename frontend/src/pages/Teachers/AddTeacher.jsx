import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addTeacher } from "../../services/teacherService";

const INITIAL_TEACHER = {
    teacherId: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    qualification: "",
    specialization: "",
    experience: "",
    joiningDate: "",
    salary: "",
    address: "",
    status: "Active"
};

function AddTeacher() {
    const navigate = useNavigate();

    const [teacher, setTeacher] = useState({ ...INITIAL_TEACHER });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setTeacher((previous) => ({
            ...previous,
            [name]: value
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleReset = () => {
        setTeacher({ ...INITIAL_TEACHER });
        setErrors({});
        setApiError(null);
        setApiSuccess(null);
    };

    const validateForm = () => {
        let validationErrors = {};

        if (!teacher.firstName || teacher.firstName.trim() === "") {
            validationErrors.firstName = "First Name is required";
        }

        if (!teacher.lastName || teacher.lastName.trim() === "") {
            validationErrors.lastName = "Last Name is required";
        }

        if (teacher.mobile && !/^[0-9]{10}$/.test(teacher.mobile.trim())) {
            validationErrors.mobile = "Enter valid 10-digit Mobile Number";
        }

        if (teacher.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(teacher.email.trim())) {
            validationErrors.email = "Enter valid Email address";
        }

        if (teacher.dob) {
            const dobDate = new Date(teacher.dob);
            if (!isNaN(dobDate.getTime()) && dobDate > new Date()) {
                validationErrors.dob = "Date of Birth cannot be in the future";
            }
        }

        if (teacher.experience !== "" && teacher.experience !== undefined && teacher.experience !== null) {
            const expNum = Number(teacher.experience);
            if (isNaN(expNum) || expNum < 0) {
                validationErrors.experience = "Experience must be a non-negative number";
            }
        }

        if (teacher.salary !== "" && teacher.salary !== undefined && teacher.salary !== null) {
            const salNum = Number(teacher.salary);
            if (isNaN(salNum) || salNum < 0) {
                validationErrors.salary = "Salary must be a non-negative amount";
            }
        }

        if (!teacher.specialization || teacher.specialization === "") {
            validationErrors.specialization = "Select Subject / Specialization";
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const payload = {
                ...teacher,
                firstName: teacher.firstName.trim(),
                lastName: teacher.lastName.trim(),
                fullName: `${teacher.firstName.trim()} ${teacher.lastName.trim()}`,
                mobile: teacher.mobile ? teacher.mobile.trim() : "",
                email: teacher.email ? teacher.email.trim() : ""
            };

            const result = await addTeacher(payload);
            const successMsg = result && result.loginCreated
                ? `Teacher Added Successfully. Login: ${payload.email} / ${result.tempPassword} (share this with the teacher).`
                : "Teacher Added Successfully" + (result && result.loginNote ? `. ${result.loginNote}` : "");
            setApiSuccess(successMsg);
            setTimeout(() => navigate("/teachers"), result && result.loginCreated ? 3500 : 1500);
        } catch (error) {
            console.error(error);
            setApiError(error.message || "Failed To Add Teacher");
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Add Teacher"
                subtitle="Register New Faculty Member"
            />

            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    {apiError && <div className="alert alert-danger d-flex align-items-center gap-2 mb-4"><i className="bi bi-exclamation-triangle-fill"></i> {apiError}</div>}
                    {apiSuccess && <div className="alert alert-success d-flex align-items-center gap-2 mb-4"><i className="bi bi-check-circle-fill"></i> {apiSuccess}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Teacher ID */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Teacher ID
                                </label>
                                <Input
                                    type="text"
                                    name="teacherId"
                                    value={teacher.teacherId}
                                    placeholder="Auto Generated (e.g. TCH001)"
                                    readOnly
                                    className="bg-light"
                                />
                            </div>

                            {/* First Name */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    First Name <span className="text-danger">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="firstName"
                                    value={teacher.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter First Name"
                                    className={errors.firstName ? "is-invalid" : ""}
                                />
                                {errors.firstName && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.firstName}
                                    </small>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Last Name <span className="text-danger">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="lastName"
                                    value={teacher.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter Last Name"
                                    className={errors.lastName ? "is-invalid" : ""}
                                />
                                {errors.lastName && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.lastName}
                                    </small>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Gender
                                </label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={teacher.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Date of Birth */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Date of Birth
                                </label>
                                <Input
                                    type="date"
                                    name="dob"
                                    value={teacher.dob}
                                    onChange={handleChange}
                                    className={errors.dob ? "is-invalid" : ""}
                                />
                                {errors.dob && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.dob}
                                    </small>
                                )}
                            </div>

                            {/* Mobile */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Mobile Number
                                </label>
                                <Input
                                    type="text"
                                    name="mobile"
                                    value={teacher.mobile}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    className={errors.mobile ? "is-invalid" : ""}
                                />
                                {errors.mobile && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.mobile}
                                    </small>
                                )}
                            </div>

                            {/* Email */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={teacher.email}
                                    onChange={handleChange}
                                    placeholder="teacher@example.com"
                                    className={errors.email ? "is-invalid" : ""}
                                />
                                {errors.email && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.email}
                                    </small>
                                )}
                            </div>

                            {/* Qualification */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Qualification
                                </label>
                                <Input
                                    type="text"
                                    name="qualification"
                                    value={teacher.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. M.Tech, Ph.D, MCA"
                                />
                            </div>

                            {/* Specialization / Subject */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Specialization / Subject <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.specialization ? "is-invalid" : ""}`}
                                    name="specialization"
                                    value={teacher.specialization}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Full Stack Development">Full Stack Development</option>
                                    <option value="React.js">React.js</option>
                                    <option value="Node.js">Node.js</option>
                                    <option value="Python">Python</option>
                                    <option value="Java">Java</option>
                                    <option value="PHP & Laravel">PHP &amp; Laravel</option>
                                    <option value="Database Systems">Database Systems</option>
                                    <option value="Web Development">Web Development</option>
                                </select>
                                {errors.specialization && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.specialization}
                                    </small>
                                )}
                            </div>

                            {/* Experience */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Experience (Years)
                                </label>
                                <Input
                                    type="number"
                                    name="experience"
                                    min="0"
                                    step="0.5"
                                    value={teacher.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 3"
                                    className={errors.experience ? "is-invalid" : ""}
                                />
                                {errors.experience && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.experience}
                                    </small>
                                )}
                            </div>

                            {/* Joining Date */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Joining Date
                                </label>
                                <Input
                                    type="date"
                                    name="joiningDate"
                                    value={teacher.joiningDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Salary */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Salary (₹)
                                </label>
                                <Input
                                    type="number"
                                    name="salary"
                                    min="0"
                                    value={teacher.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 45000"
                                    className={errors.salary ? "is-invalid" : ""}
                                />
                                {errors.salary && (
                                    <small className="text-danger d-block mt-1">
                                        {errors.salary}
                                    </small>
                                )}
                            </div>

                            {/* Status */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-semibold">
                                    Status
                                </label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={teacher.status}
                                    onChange={handleChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div className="col-12 mb-3">
                                <label className="form-label fw-semibold">
                                    Address
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    name="address"
                                    value={teacher.address}
                                    onChange={handleChange}
                                    placeholder="Residential Address"
                                ></textarea>
                            </div>
                        </div>

                        {/* Action Buttons with functional Reset & Cancel */}
                        <div className="d-flex gap-2 mt-4">
                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Save Teacher"}
                                className="btn btn-primary"
                                disabled={isSaving}
                            />

                            <Button
                                type="button"
                                text="Reset"
                                className="btn btn-warning"
                                onClick={handleReset}
                                disabled={isSaving}
                            />

                            <Button
                                type="button"
                                text="Cancel"
                                className="btn btn-secondary"
                                onClick={() => navigate("/teachers")}
                                disabled={isSaving}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AddTeacher;
