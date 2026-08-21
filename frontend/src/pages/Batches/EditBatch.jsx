import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { getBatchById, updateBatch } from "../../services/batchService";
import { getTeachers } from "../../services/teacherService";

function EditBatch() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [batch, setBatch] = useState({
        batchCode: "",
        batchName: "",
        course: "",
        teacherId: "",
        teacher: "",
        startDate: "",
        endDate: "",
        timing: "",
        room: "",
        maxStudents: "",
        status: "Active",
        description: ""
    });

    const [teachers, setTeachers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);

    useEffect(() => {
        async function loadBatch() {
            try {
                const data = await getBatchById(id);
                if (data) setBatch(data);
            } catch (error) {
                console.error("Failed to load batch data:", error);
                setApiError("Failed to load batch data.");
            }
        }
        loadBatch();
        getTeachers().then(setTeachers).catch(() => setTeachers([]));
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setBatch((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        setIsSaving(true);
        try {
            await updateBatch(id, batch);
            setApiSuccess("Batch Updated Successfully");
            setTimeout(() => navigate("/batches"), 1500);
        } catch (error) {
            console.log(error);
            setApiError(error.message || "Failed To Update Batch");
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <PageHeader title="Edit Batch" subtitle="Update Batch Information" />

            <div className="card shadow-sm">
                <div className="card-body">
                    {apiError && <div className="alert alert-danger">{apiError}</div>}
                    {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch Code</label>
                                <Input type="text" name="batchCode" value={batch.batchCode} readOnly />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch Name</label>
                                <Input type="text" name="batchName" value={batch.batchName} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course</label>
                                <select className="form-select" name="course" value={batch.course} onChange={handleChange}>
                                    <option value="">Select Course</option>
                                    <option>React JS</option>
                                    <option>MERN Stack</option>
                                    <option>PHP &amp; MySQL</option>
                                    <option>Java Programming</option>
                                    <option>Python Programming</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Teacher</label>
                                <select className="form-select" name="teacherId" value={batch.teacherId || ""} onChange={handleChange}>
                                    <option value="">Select Teacher</option>
                                    {teachers.map((t, i) => (
                                        <option key={t._id || i} value={t.teacherId}>
                                            {`${t.firstName || ""} ${t.lastName || ""}`.trim() || t.teacherId}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Date</label>
                                <Input type="date" name="startDate" value={batch.startDate} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">End Date</label>
                                <Input type="date" name="endDate" value={batch.endDate} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Batch Timing</label>
                                <Input type="text" name="timing" value={batch.timing} onChange={handleChange} placeholder="09:00 AM - 11:00 AM" />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Room Number</label>
                                <Input type="text" name="room" value={batch.room} onChange={handleChange} placeholder="Room No." />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Maximum Students</label>
                                <Input type="number" name="maxStudents" value={batch.maxStudents} onChange={handleChange} />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select className="form-select" name="status" value={batch.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="col-12 mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    name="description"
                                    value={batch.description}
                                    onChange={handleChange}
                                    placeholder="Batch Description"
                                ></textarea>
                            </div>

                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <Button type="submit" text={isSaving ? "Saving..." : "Update Batch"} className="btn btn-success" disabled={isSaving} />
                            <Button type="button" text="Cancel" className="btn btn-secondary" onClick={() => navigate("/batches")} disabled={isSaving} />
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default EditBatch;
