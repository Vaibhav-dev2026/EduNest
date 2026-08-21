import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { getTeacherById, updateTeacher } from "../../services/teacherService";

function EditTeacher() {

    const navigate = useNavigate();

    const { id } = useParams();

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

        status: ""

    });

    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadTeacher() {
            try {
                const data = await getTeacherById(id);
                if (data) {
                    setTeacher(data);
                }
            } catch (error) {
                console.error("Failed to load teacher:", error);
                setApiError("Failed to load teacher data.");
            }
        }
        loadTeacher();
    }, [id]);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setTeacher((previous) => ({

            ...previous,

            [name]: value

        }));

    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        setIsSaving(true);
        try {
            await updateTeacher(id, teacher);
            setApiSuccess("Teacher Updated Successfully");
            setTimeout(() => navigate("/teachers"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Update Teacher");
            setIsSaving(false);
        }
    };
        return (

        <AdminLayout>

            <PageHeader
                title="Edit Teacher"
                subtitle="Update Teacher Information"
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
                                />

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
                                text={isSaving ? "Saving..." : "Update Teacher"}
                                className="btn btn-success"
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

export default EditTeacher;