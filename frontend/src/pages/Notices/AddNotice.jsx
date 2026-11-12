import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { addNotice } from "../../services/noticeService";
import { getBatches } from "../../services/batchService";

function AddNotice() {

    const navigate = useNavigate();

    const [batches, setBatches] = useState([]);

    useEffect(() => {
        getBatches().then(data => setBatches(data || [])).catch(() => {});
    }, []);

    const [notice, setNotice] = useState({

        title: "",

        audience: "",

        publishDate: "",

        expiryDate: "",

        priority: "Medium",

        attachment: null,

        description: ""

    });

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    const handleReset = () => {
        setNotice({
            title: "",
            audience: "",
            publishDate: "",
            expiryDate: "",
            priority: "Medium",
            attachment: null,
            description: ""
        });
        setErrors({});
        setApiError(null);
        setApiSuccess(null);
    };

    const handleChange = (event) => {

        const { name, value, files } = event.target;

        setNotice((previous) => ({

            ...previous,

            [name]: files ? files[0] : value

        }));

    };

    const validateForm = () => {

        let validationErrors = {};

        if (notice.title.trim() === "") {

            validationErrors.title = "Notice Title is required";

        }

        if (notice.audience === "") {

            validationErrors.audience = "Please Select Audience";

        }

        if (notice.publishDate === "") {

            validationErrors.publishDate = "Publish Date is required";

        }

        if (notice.expiryDate === "") {

            validationErrors.expiryDate = "Expiry Date is required";

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
            await addNotice(notice);
            setApiSuccess("Notice Added Successfully");
            setTimeout(() => navigate("/notices"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Save Notice");
            setIsSaving(false);
        }
    };
        return (

        <AdminLayout>

            <PageHeader
                title="Add Notice"
                subtitle="Create Institute Notice"
            />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Notice Title
                                </label>

                                <Input
                                    type="text"
                                    name="title"
                                    value={notice.title}
                                    onChange={handleChange}
                                    placeholder="Enter Notice Title"
                                />

                                {

                                    errors.title &&

                                    <small className="text-danger">

                                        {errors.title}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Audience
                                </label>

                                <select
                                    className="form-select"
                                    name="audience"
                                    value={notice.audience}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select Audience
                                    </option>
                                    <option value="All">All (Students &amp; Teachers)</option>
                                    <option value="All Students">All Students</option>
                                    <option value="All Teachers">All Teachers</option>
                                    {batches.map(b => (
                                        <option key={b._id} value={b.batchName || b.batchCode}>
                                            {b.batchName || b.batchCode}
                                        </option>
                                    ))}
                                    <option value="React Batch">React Batch</option>
                                    <option value="MERN Batch">MERN Batch</option>
                                    <option value="PHP Batch">PHP Batch</option>
                                </select>

                                {

                                    errors.audience &&

                                    <small className="text-danger">

                                        {errors.audience}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Publish Date
                                </label>

                                <Input
                                    type="date"
                                    name="publishDate"
                                    value={notice.publishDate}
                                    onChange={handleChange}
                                />

                                {

                                    errors.publishDate &&

                                    <small className="text-danger">

                                        {errors.publishDate}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Expiry Date
                                </label>

                                <Input
                                    type="date"
                                    name="expiryDate"
                                    value={notice.expiryDate}
                                    onChange={handleChange}
                                />

                                {

                                    errors.expiryDate &&

                                    <small className="text-danger">

                                        {errors.expiryDate}

                                    </small>

                                }

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Priority
                                </label>

                                <select
                                    className="form-select"
                                    name="priority"
                                    value={notice.priority}
                                    onChange={handleChange}
                                >

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="Low">
                                        Low
                                    </option>

                                </select>

                            </div>

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Attachment
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    name="attachment"
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="col-12 mb-3">

                                <label className="form-label">
                                    Description
                                </label>

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
                            <Button type="submit" text={isSaving ? "Saving..." : "Save Notice"} className="btn btn-primary" disabled={isSaving} />
                            <Button type="button" text="Reset" className="btn btn-warning" onClick={handleReset} disabled={isSaving} />
                            <Button type="button" text="Cancel" className="btn btn-secondary" onClick={() => navigate("/notices")} disabled={isSaving} />
                        </div>

                    </form>

                </div>

            </div>

        </AdminLayout>

    );

}

export default AddNotice;