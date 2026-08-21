import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addTeacher } from "../../services/teacherService";

function AddTeacher() {

    const navigate = useNavigate();

    const [teacher, setTeacher] = useState({

        teacherId: "",

        fullName: "",

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

    });

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

    };

    const validateForm = () => {

        let validationErrors = {};

        if (teacher.fullName.trim() === "") {

            validationErrors.fullName = "Teacher Name is required";

        }

        if (!/^[0-9]{10}$/.test(teacher.mobile)) {

            validationErrors.mobile = "Enter valid Mobile Number";

        }

        if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(teacher.email)
        ) {

            validationErrors.email = "Enter valid Email";

        }

        if (teacher.specialization === "") {

            validationErrors.specialization = "Select Subject";

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
            const result = await addTeacher(teacher);
            const successMsg = result && result.loginCreated
                ? `Teacher Added Successfully. Login: ${teacher.email} / ${result.tempPassword} (share this with the teacher — they should change it after first login).`
                : "Teacher Added Successfully" + (result && result.loginNote ? `. ${result.loginNote}` : "");
            setApiSuccess(successMsg);
            setTimeout(() => navigate("/teachers"), result && result.loginCreated ? 4000 : 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Add Teacher");
            setIsSaving(false);
        }
    };
        return (

        <AdminLayout>

            <PageHeader
                title="Add Teacher"
                subtitle="Register New Teacher"
            />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Teacher ID
                                </label>

                                <Input
                                    type="text"
                                    name="teacherId"
                                    value={teacher.teacherId}
                                    placeholder="Auto Generated (e.g. TCH001)"
                                    readOnly
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Full Name
                                </label>

                                <Input
                                    type="text"
                                    name="fullName"
                                    value={teacher.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter Teacher Name"
                                />

                                {
                                    errors.fullName &&
                                    <small className="text-danger">
                                        {errors.fullName}
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
                                    value={teacher.gender}
                                    onChange={handleChange}
                                >

                                    <option value="">Select Gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Date of Birth
                                </label>

                                <Input
                                    type="date"
                                    name="dob"
                                    value={teacher.dob}
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
                                    value={teacher.mobile}
                                    onChange={handleChange}
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
                                    value={teacher.email}
                                    onChange={handleChange}
                                />

                                {
                                    errors.email &&
                                    <small className="text-danger">
                                        {errors.email}
                                    </small>
                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Qualification
                                </label>

                                <Input
                                    type="text"
                                    name="qualification"
                                    value={teacher.qualification}
                                    onChange={handleChange}
                                    placeholder="BCA / MCA / M.Tech"
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Specialization
                                </label>

                                <select
                                    className="form-select"
                                    name="specialization"
                                    value={teacher.specialization}
                                    onChange={handleChange}
                                >

                                    <option value="">Select Subject</option>

                                    <option>React JS</option>
                                    <option>PHP</option>
                                    <option>Java</option>
                                    <option>Python</option>
                                    <option>MERN Stack</option>

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Experience
                                </label>

                                <Input
                                    type="text"
                                    name="experience"
                                    value={teacher.experience}
                                    onChange={handleChange}
                                    placeholder="5 Years"
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Joining Date
                                </label>

                                <Input
                                    type="date"
                                    name="joiningDate"
                                    value={teacher.joiningDate}
                                    onChange={handleChange}
                                />

                            </div>
                                                        <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Salary (₹)
                                </label>

                                <Input
                                    type="number"
                                    name="salary"
                                    value={teacher.salary}
                                    onChange={handleChange}
                                    placeholder="Enter Monthly Salary"
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    name="status"
                                    value={teacher.status}
                                    onChange={handleChange}
                                >

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            <div className="col-12 mb-3">

                                <label className="form-label">
                                    Address
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    name="address"
                                    value={teacher.address}
                                    onChange={handleChange}
                                ></textarea>

                            </div>

                            <div className="col-md-6 mb-4">

                                <label className="form-label">
                                    Teacher Photo
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                />

                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">

                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Save Teacher"}
                                className="btn btn-primary"
                                disabled={isSaving}
                            />

                            <Button
                                type="reset"
                                text="Reset"
                                className="btn btn-warning"
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