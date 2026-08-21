import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { getCourseById, updateCourse } from "../../services/courseService";

function EditCourse() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [course, setCourse] = useState({
        courseCode: "",
        courseName: "",
        category: "",
        duration: "",
        fees: "",
        trainer: "",
        batchSize: "",
        description: "",
        status: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadCourse() {
            try {
                const data = await getCourseById(id);
                if (data) {
                    setCourse(data);
                }
            } catch (error) {
                console.error("Failed to load course data:", error);
                setApiError("Failed to load course data.");
            }
        }
        loadCourse();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCourse((previous) => ({
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
            await updateCourse(id, course);
            setApiSuccess("Course Updated Successfully");
            setTimeout(() => navigate("/courses"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Update Course");
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <PageHeader
                title="Edit Course"
                subtitle="Update Course Information"
            />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course Code</label>
                                <Input
                                    type="text"
                                    name="courseCode"
                                    value={course.courseCode}
                                    readOnly
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course Name</label>
                                <Input
                                    type="text"
                                    name="courseName"
                                    value={course.courseName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category"
                                    value={course.category}
                                    onChange={handleChange}
                                >
                                    <option>Programming</option>
                                    <option>Web Development</option>
                                    <option>Database</option>
                                    <option>Design</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Duration</label>
                                <Input
                                    type="text"
                                    name="duration"
                                    value={course.duration}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course Fee (₹)</label>
                                <Input
                                    type="number"
                                    name="fees"
                                    value={course.fees}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Trainer</label>
                                <Input
                                    type="text"
                                    name="trainer"
                                    value={course.trainer}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch Size</label>
                                <Input
                                    type="number"
                                    name="batchSize"
                                    value={course.batchSize}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    name="status"
                                    value={course.status}
                                    onChange={handleChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="col-12 mb-3">
                                <label className="form-label">Course Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    name="description"
                                    value={course.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div> {/* ✅ FIXED: Missing closing div for 'row' added here */}

                        <div className="d-flex gap-2 mt-4">
                            <Button
                                type="submit"
                                text={isSaving ? "Saving..." : "Update Course"}
                                className="btn btn-success"
                                disabled={isSaving}
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

export default EditCourse;
