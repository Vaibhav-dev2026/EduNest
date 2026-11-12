import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addCourse } from "../../services/courseService";

function AddCourse() {

    const navigate = useNavigate();

    const [course, setCourse] = useState({

        courseCode: "",

        courseName: "",

        category: "",

        duration: "",

        fees: "",

        trainer: "",

        batchSize: "",

        description: "",

        status: "Active"

    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setCourse((previous) => ({

            ...previous,

            [name]: value

        }));

    };

    const validateForm = () => {

        let validationErrors = {};

        if (course.courseName.trim() === "") {

            validationErrors.courseName = "Course Name is required";

        }

        if (course.duration.trim() === "") {

            validationErrors.duration = "Duration is required";

        }

        if (course.fees === "") {

            validationErrors.fees = "Course Fee is required";

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
            await addCourse(course);
            setApiSuccess("Course Added Successfully");
            setTimeout(() => navigate("/courses"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Add Course");
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setCourse({
            courseCode: "",
            courseName: "",
            category: "",
            duration: "",
            fees: "",
            trainer: "",
            batchSize: "",
            description: "",
            status: "Active"
        });
        setErrors({});
        setApiError(null);
        setApiSuccess(null);
    };
        return (

        <AdminLayout>

            <PageHeader
                title="Add Course"
                subtitle="Create New Course"
            />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Course Code
                                </label>

                                <Input
                                    type="text"
                                    name="courseCode"
                                    value={course.courseCode}
                                    placeholder="Auto Generated (e.g. CRS001)"
                                    readOnly
                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Course Name
                                </label>

                                <Input
                                    type="text"
                                    name="courseName"
                                    value={course.courseName}
                                    onChange={handleChange}
                                    placeholder="Enter Course Name"
                                />

                                {

                                    errors.courseName &&

                                    <small className="text-danger">

                                        {errors.courseName}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Category

                                </label>

                                <select

                                    className="form-select"

                                    name="category"

                                    value={course.category}

                                    onChange={handleChange}

                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option>Programming</option>

                                    <option>Web Development</option>

                                    <option>Database</option>

                                    <option>Design</option>

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Duration

                                </label>

                                <Input

                                    type="text"

                                    name="duration"

                                    value={course.duration}

                                    onChange={handleChange}

                                    placeholder="Example : 6 Months"

                                />

                                {

                                    errors.duration &&

                                    <small className="text-danger">

                                        {errors.duration}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Course Fee (₹)

                                </label>

                                <Input

                                    type="number"

                                    name="fees"

                                    value={course.fees}

                                    onChange={handleChange}

                                    placeholder="Enter Course Fee"

                                />

                                {

                                    errors.fees &&

                                    <small className="text-danger">

                                        {errors.fees}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Trainer

                                </label>

                                <Input

                                    type="text"

                                    name="trainer"

                                    value={course.trainer}

                                    onChange={handleChange}

                                    placeholder="Trainer Name"

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Batch Size

                                </label>

                                <Input

                                    type="number"

                                    name="batchSize"

                                    value={course.batchSize}

                                    onChange={handleChange}

                                    placeholder="Maximum Students"

                                />

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">

                                    Status

                                </label>

                                <select

                                    className="form-select"

                                    name="status"

                                    value={course.status}

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

                                    Course Description

                                </label>

                                <textarea

                                    className="form-control"

                                    rows="4"

                                    name="description"

                                    value={course.description}

                                    onChange={handleChange}

                                    placeholder="Write Course Description"

                                ></textarea>

                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">

                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Save Course"}
                                className="btn btn-primary"
                                disabled={isSaving}
                            />

                            <Button
                                type="button"
                                text="Reset"
                                className="btn btn-warning"
                                disabled={isSaving}
                                onClick={handleReset}
                            />

                            <Button

                                type="button"

                                text="Cancel"

                                className="btn btn-secondary"

                                onClick={() => navigate("/courses")}
                                disabled={isSaving}
                            />

                        </div>

                    </form>

                </div>

            </div>

        </AdminLayout>

    );

}

export default AddCourse;