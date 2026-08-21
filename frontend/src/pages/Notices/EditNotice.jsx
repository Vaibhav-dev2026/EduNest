import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { getNoticeById, updateNotice } from "../../services/noticeService";

function EditNotice() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [notice, setNotice] = useState({
        title: "",
        audience: "",
        publishDate: "",
        expiryDate: "",
        priority: "Medium",
        description: ""
    });

    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadNotice() {
            try {
                const data = await getNoticeById(id);
                if (data) setNotice(data);
            } catch (error) {
                console.log(error);
                setApiError("Failed to load notice.");
            }
        }
        loadNotice();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setNotice((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);
        setIsSaving(true);
        try {
            await updateNotice(id, notice);
            setApiSuccess("Notice Updated Successfully");
            setTimeout(() => navigate("/notices"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Update Notice");
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <PageHeader title="Edit Notice" subtitle="Update Notice Information" />
            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Notice Title</label>
                                <Input type="text" name="title" value={notice.title} onChange={handleChange} placeholder="Enter Notice Title" />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Audience</label>
                                <select className="form-select" name="audience" value={notice.audience} onChange={handleChange}>
                                    <option value="">Select Audience</option>
                                    <option>All Students</option>
                                    <option>All Teachers</option>
                                    <option>React Batch</option>
                                    <option>MERN Batch</option>
                                    <option>PHP Batch</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Publish Date</label>
                                <Input type="date" name="publishDate" value={notice.publishDate} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Expiry Date</label>
                                <Input type="date" name="expiryDate" value={notice.expiryDate} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Priority</label>
                                <select className="form-select" name="priority" value={notice.priority} onChange={handleChange}>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="col-12 mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    name="description"
                                    value={notice.description}
                                    onChange={handleChange}
                                    placeholder="Enter Notice Description"
                                ></textarea>
                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <Button type="submit" text={isSaving ? "Saving..." : "Update Notice"} className="btn btn-success" disabled={isSaving} />
                            <Button type="button" text="Cancel" className="btn btn-secondary" onClick={() => navigate("/notices")} disabled={isSaving} />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default EditNotice;
