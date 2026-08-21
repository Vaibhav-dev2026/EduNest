import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
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

function AdminProfile() {
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
                address: data.address || "",
                email: data.email || ""
            });
            setPreviewUrl(null);
            setPhotoFile(null);
        } catch (err) {
            setError(err.message || "Failed to load profile.");
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
            formData.append("address", form.address || "");
            if (photoFile) {
                formData.append("photo", photoFile);
            }

            await updateProfile(formData);
            setSuccessMsg("Profile updated successfully!");
            setEditMode(false);
            await loadProfile();
        } catch (err) {
            setSaveError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    const currentPhoto = previewUrl || (profile?.profilePhoto || profile?.photo ? getFileUrl(profile.profilePhoto || profile.photo) : null);

    return (
        <AdminLayout>
            <PageHeader title="My Profile" subtitle="View and manage your administrator details and profile photo" />

            {loading && <Loader text="Loading administrator profile..." />}

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
                                            alt={profile.fullName || "Administrator"}
                                            className="rounded-circle object-fit-cover shadow-sm border border-2 border-primary border-opacity-25"
                                            style={{ width: 72, height: 72 }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm"
                                            style={{ width: 72, height: 72 }}
                                        >
                                            {(profile.firstName || "A")[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-bold text-dark">{profile.fullName || "Administrator"}</h4>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-primary-subtle text-primary">Administrator</span>
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
                                    { label: "First Name", value: NA(profile.firstName) },
                                    { label: "Last Name", value: NA(profile.lastName) },
                                    { label: "Full Name", value: NA(profile.fullName) },
                                    { label: "Email Address", value: NA(profile.email) },
                                    { label: "Mobile Number", value: NA(profile.mobile) },
                                    { label: "Gender", value: NA(profile.gender) },
                                    { label: "Role", value: "Administrator" },
                                    { label: "Status", value: profile.status || "Active" },
                                    { label: "Address", value: NA(profile.address) },
                                ].map(({ label, value }) => (
                                    <div className="col-md-6 mb-3" key={label}>
                                        <label className="text-muted small text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                                            {label}
                                        </label>
                                        <div className="fw-semibold text-dark fs-6">{value}</div>
                                    </div>
                                ))}
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
                                        <label className="form-label">First Name</label>
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
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
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
                                        <label className="form-label">Email (Read Only)</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={form.email}
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
        </AdminLayout>
    );
}

export default AdminProfile;
