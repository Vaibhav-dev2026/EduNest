import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getProfile, updateProfile } from "../../services/profileService";
import { getFileUrl } from "../../services/api";

function NA(value) {
    if (value === null || value === undefined || String(value).trim() === "") {
        return "Not Available";
    }
    return value;
}

function TeacherProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        setLoading(true);
        setError(null);
        try {
            const data = await getProfile();
            setProfile(data);
            setForm({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                mobile: data.mobile || "",
                gender: data.gender || "",
                qualification: data.qualification || "",
                specialization: data.specialization || data.subject || "",
                subject: data.subject || data.specialization || "",
                experience: data.experience || "0",
                address: data.address || "",
                salary: data.salary || "",
                dob: data.dob || "",
                joiningDate: data.joiningDate || "",
                email: data.email || "",
                teacherId: data.teacherId || data.referenceId || ""
            });
            setPreviewUrl(null);
            setPhotoFile(null);
        } catch (err) {
            setError(err.message || "Failed to load your profile.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handlePhotoChange(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        setSuccessMsg(null);

        try {
            const formData = new FormData();
            formData.append("firstName", form.firstName || "");
            formData.append("lastName", form.lastName || "");
            formData.append("mobile", form.mobile || "");
            formData.append("gender", form.gender || "");
            formData.append("qualification", form.qualification || "");
            formData.append("specialization", form.specialization || "");
            formData.append("subject", form.subject || "");
            formData.append("experience", form.experience || "");
            formData.append("salary", form.salary || "");
            formData.append("address", form.address || "");
            formData.append("dob", form.dob || "");
            formData.append("joiningDate", form.joiningDate || "");
            if (photoFile) {
                formData.append("photo", photoFile);
            }

            await updateProfile(formData);
            setSuccessMsg("Profile updated successfully!");
            setEditMode(false);
            await loadProfile();
        } catch (err) {
            setSaveError(err.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function formatDate(dateStr, formattedFallback) {
        if (formattedFallback && formattedFallback !== "Not Available") return formattedFallback;
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-GB");
    }

    const currentPhoto = previewUrl || (profile?.profilePhoto || profile?.photo ? getFileUrl(profile.profilePhoto || profile.photo) : null);

    return (
        <TeacherLayout>
            <PageHeader title="My Profile" subtitle="View and manage your teacher details and profile photo" />

            {loading && <Loader text="Loading profile..." />}

            {!loading && error && (
                <div className="alert alert-danger mt-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadProfile}>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && profile && (
                <div className="card shadow-sm border-0 mt-4">
                    <div className="card-body p-4">
                        {successMsg && (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-check-circle-fill"></i> {successMsg}
                            </div>
                        )}
                        {saveError && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-exclamation-triangle-fill"></i> {saveError}
                            </div>
                        )}

                        {/* Card Header & Avatar */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border-bottom pb-4 mb-4 gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="position-relative">
                                    {currentPhoto ? (
                                        <img
                                            src={currentPhoto}
                                            alt={profile.fullName || "Teacher"}
                                            className="rounded-circle object-fit-cover shadow-sm border border-2 border-primary border-opacity-25"
                                            style={{ width: 72, height: 72 }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm"
                                            style={{ width: 72, height: 72 }}
                                        >
                                            {(profile.firstName || "T")[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-bold text-dark">
                                        {profile.firstName || ""} {profile.lastName || ""}
                                    </h4>
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className="badge bg-primary-subtle text-primary">{profile.teacherId || profile.referenceId || "Teacher"}</span>
                                        {profile.subject && <span className="badge bg-light text-dark">{profile.subject}</span>}
                                        <span className="text-muted small">{profile.email}</span>
                                    </div>
                                </div>
                            </div>
                            {!editMode && (
                                <button
                                    className="btn btn-outline-primary align-self-start align-self-sm-center"
                                    onClick={() => { setEditMode(true); setSaveError(null); setSuccessMsg(null); }}
                                >
                                    <i className="bi bi-pencil me-1"></i> Edit Profile
                                </button>
                            )}
                        </div>

                        {/* ── VIEW MODE ─────────────────────────────────────── */}
                        {!editMode && (
                            <div className="row">
                                {[
                                    { label: "Teacher ID", value: NA(profile.teacherId || profile.referenceId) },
                                    { label: "First Name", value: NA(profile.firstName) },
                                    { label: "Last Name", value: NA(profile.lastName) },
                                    { label: "Full Name", value: NA(`${profile.firstName || ""} ${profile.lastName || ""}`.trim()) },
                                    { label: "Email", value: NA(profile.email) },
                                    { label: "Mobile", value: NA(profile.mobile) },
                                    { label: "Gender", value: NA(profile.gender) },
                                    { label: "Date of Birth", value: NA(formatDate(profile.dob || profile.dateOfBirth, profile.dobFormatted)) },
                                    { label: "Qualification", value: NA(profile.qualification) },
                                    { label: "Specialization", value: NA(profile.specialization || profile.subject) },
                                    { label: "Subject", value: NA(profile.subject || profile.specialization) },
                                    { label: "Experience", value: profile.experience ? `${profile.experience} yrs` : "0 yrs" },
                                    { label: "Joining Date", value: NA(formatDate(profile.joiningDate, profile.joiningDateFormatted)) },
                                    { label: "Salary", value: profile.salary ? `₹${Number(profile.salary).toLocaleString("en-IN")}` : "Not Available" },
                                    { label: "Address", value: NA(profile.address) },
                                ].map(({ label, value }) => (
                                    <div className="col-md-6 mb-3" key={label}>
                                        <label className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                                            {label}
                                        </label>
                                        <div className="fw-semibold text-dark fs-6">{value}</div>
                                    </div>
                                ))}

                                <div className="col-md-6 mb-3">
                                    <label className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                                        Status
                                    </label>
                                    <div>
                                        <span className={`badge ${profile.status === "Active" ? "bg-success" : "bg-danger"}`}>
                                            {profile.status || "Active"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── EDIT MODE ─────────────────────────────────────── */}
                        {editMode && (
                            <form onSubmit={handleSave}>
                                <div className="row">
                                    {/* Change Profile Photo Input */}
                                    <div className="col-12 mb-4 p-3 bg-light rounded-3 border">
                                        <label className="form-label fw-bold d-block mb-2">
                                            <i className="bi bi-camera me-1"></i> Change Profile Photo
                                        </label>
                                        <div className="d-flex align-items-center gap-3">
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                            {previewUrl && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm text-nowrap"
                                                    onClick={() => { setPhotoFile(null); setPreviewUrl(null); }}
                                                >
                                                    Clear Preview
                                                </button>
                                            )}
                                        </div>
                                        <small className="text-muted d-block mt-1">Supported formats: JPG, PNG, WEBP, GIF (Max: 5 MB)</small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">First Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Last Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Gender</label>
                                        <select
                                            className="form-select"
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Qualification</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="qualification"
                                            value={form.qualification}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Specialization</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="specialization"
                                            value={form.specialization}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Subject</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Experience (Years)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="experience"
                                            value={form.experience}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="dob"
                                            value={form.dob ? String(form.dob).split("T")[0] : ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Joining Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="joiningDate"
                                            value={form.joiningDate ? String(form.joiningDate).split("T")[0] : ""}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email (Read Only)</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={form.email}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Teacher ID (Read Only)</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={form.teacherId}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-md-12 mb-3">
                                        <label className="form-label">Address</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 mt-3">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
                                        ) : (
                                            <><i className="bi bi-check-lg me-1"></i> Save Changes</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={saving}
                                        onClick={() => { setEditMode(false); setPreviewUrl(null); setPhotoFile(null); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </TeacherLayout>
    );
}

export default TeacherProfile;
