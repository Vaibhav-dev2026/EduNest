import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";

import { addMaterial } from "../../services/materialService";
import { getTeachers } from "../../services/teacherService";
import { getCourses } from "../../services/courseService";
import { getBatches } from "../../services/batchService";
import { getCurrentUser } from "../../services/authService";

function UploadMaterial() {
    const navigate = useNavigate();

    const currentUser = getCurrentUser() || {};
    const isTeacherRole = currentUser.role === "teacher";

    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    const [material, setMaterial] = useState({
        title: "",
        subject: "",
        course: "",
        batch: "",
        teacher: isTeacherRole ? (currentUser.referenceId || "") : "",
        materialType: "PDF",
        file: null,
        description: ""
    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState("");
    const [apiSuccess, setApiSuccess] = useState("");

    const loadDropdownData = useCallback(async () => {
        try {
            const [teacherData, courseData, batchData] = await Promise.all([
                getTeachers().catch(() => []),
                getCourses().catch(() => []),
                getBatches().catch(() => [])
            ]);

            setTeachers(teacherData || []);
            setCourses(courseData || []);
            setBatches(batchData || []);

            if (isTeacherRole && currentUser.referenceId) {
                setMaterial((previous) => ({
                    ...previous,
                    teacher: currentUser.referenceId
                }));
            }
        } catch (error) {
            console.error("Failed to load dropdown data:", error);
        }
    }, [isTeacherRole, currentUser.referenceId]);

    useEffect(() => {
        loadDropdownData();
    }, [loadDropdownData]);

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        if (name === "teacher" && isTeacherRole) {
            return;
        }

        setMaterial((previous) => ({
            ...previous,
            [name]: files ? files[0] : value
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    function validateForm() {
        let validationErrors = {};

        if (!material.title || String(material.title).trim() === "") {
            validationErrors.title = "Material Title is required";
        }

        if (!material.course || String(material.course).trim() === "") {
            validationErrors.course = "Please Select Course";
        }

        if (!material.batch || String(material.batch).trim() === "") {
            validationErrors.batch = "Please Select Batch";
        }

        if (!isTeacherRole && (!material.teacher || String(material.teacher).trim() === "")) {
            validationErrors.teacher = "Please Select Teacher";
        }

        if (!material.file) {
            validationErrors.file = "Please Upload File";
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
        setApiError("");
        setApiSuccess("");

        try {
            const formData = new FormData();
            formData.append("title", String(material.title || "").trim());
            formData.append("subject", String(material.subject || "").trim());
            formData.append("courseId", material.course || "");
            formData.append("batchId", material.batch || "");
            formData.append("teacherId", isTeacherRole ? (currentUser.referenceId || "") : (material.teacher || ""));
            formData.append("materialType", material.materialType || "PDF");
            if (material.file) {
                formData.append("file", material.file);
            }
            formData.append("description", String(material.description || "").trim());

            await addMaterial(formData);

            setApiSuccess("Material Uploaded Successfully");

            setTimeout(() => {
                navigate("/materials");
            }, 1200);
        } catch (error) {
            console.error("Upload error:", error);
            setApiError(error.message || "Upload Failed");
        } finally {
            setIsSaving(false);
        }
    }

    const loggedInTeacherName = currentUser.fullName
        || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim()
        || "You";

    return (
        <AdminLayout>
            <PageHeader
                title="Upload Study Material"
                subtitle="Upload Notes, PDFs and Study Resources"
            />

            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    {apiError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-exclamation-triangle-fill"></i> {apiError}
                        </div>
                    )}

                    {apiSuccess && (
                        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-check-circle-fill"></i> {apiSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Material Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? "is-invalid" : ""}`}
                                    name="title"
                                    value={material.title}
                                    onChange={handleChange}
                                    placeholder="Enter Material Title (e.g. WFS UNIT 1)"
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="subject"
                                    value={material.subject}
                                    onChange={handleChange}
                                    placeholder="Enter Subject (e.g. PHP)"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Course <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.course ? "is-invalid" : ""}`}
                                    name="course"
                                    value={material.course}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((c) => (
                                        <option key={c._id} value={c.courseId || c.courseCode || c._id}>
                                            {c.courseName || c.name || c.courseId}
                                        </option>
                                    ))}
                                </select>
                                {errors.course && <div className="invalid-feedback">{errors.course}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Batch <span className="text-danger">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.batch ? "is-invalid" : ""}`}
                                    name="batch"
                                    value={material.batch}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map((b) => (
                                        <option key={b._id} value={b.batchId || b.batchCode || b._id}>
                                            {b.batchName || b.name || b.batchId}
                                        </option>
                                    ))}
                                </select>
                                {errors.batch && <div className="invalid-feedback">{errors.batch}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Teacher <span className="text-danger">*</span>
                                </label>
                                {isTeacherRole ? (
                                    <input
                                        type="text"
                                        className="form-control bg-light"
                                        value={loggedInTeacherName}
                                        readOnly
                                    />
                                ) : (
                                    <select
                                        className={`form-select ${errors.teacher ? "is-invalid" : ""}`}
                                        name="teacher"
                                        value={material.teacher}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher._id}
                                                value={teacher.teacherId || teacher._id}
                                            >
                                                {teacher.firstName} {teacher.lastName} ({teacher.teacherId || "Teacher"})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.teacher && <div className="invalid-feedback">{errors.teacher}</div>}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Material Type
                                </label>
                                <select
                                    className="form-select"
                                    name="materialType"
                                    value={material.materialType}
                                    onChange={handleChange}
                                >
                                    <option value="PDF">PDF</option>
                                    <option value="DOCX">DOCX</option>
                                    <option value="PPT">PPT</option>
                                    <option value="ZIP">ZIP</option>
                                    <option value="Document">Document</option>
                                    <option value="Video">Video</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">
                                    Upload File <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="file"
                                    className={`form-control ${errors.file ? "is-invalid" : ""}`}
                                    name="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                    onChange={handleChange}
                                />
                                {errors.file && <div className="invalid-feedback">{errors.file}</div>}
                            </div>

                            <div className="col-12 mb-4">
                                <label className="form-label fw-semibold">
                                    Description
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    name="description"
                                    value={material.description}
                                    onChange={handleChange}
                                    placeholder="Enter brief description of the material"
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary px-4 py-2"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-cloud-arrow-up me-1"></i> Upload Material
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary px-4 py-2"
                                disabled={isSaving}
                                onClick={() => navigate("/materials")}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default UploadMaterial;