import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import PageHeader from "../../components/common/PageHeader";
import SearchBox from "../../components/common/SearchBox";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getStudents } from "../../services/studentService";

const PAGE_SIZE = 10;

function MyStudents() {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortField, setSortField] = useState("firstName");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadStudents() {
        setLoading(true);
        setError(null);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            setError("Failed to load students list.");
        } finally {
            setLoading(false);
        }
    }

    function handleSort(field) {
        if (sortField === field) {
            setSortDir(d => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setPage(1);
    }

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <i className="bi bi-chevron-expand ms-1 text-muted small"></i>;
        return sortDir === "asc"
            ? <i className="bi bi-chevron-up ms-1 small"></i>
            : <i className="bi bi-chevron-down ms-1 small"></i>;
    };

    const filtered = students.filter(s => {
        const full = `${s.firstName || ""} ${s.lastName || ""} ${s.studentId || ""} ${s.mobile || ""}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    const sorted = [...filtered].sort((a, b) => {
        const aVal = (a[sortField] || "").toString().toLowerCase();
        const bVal = (b[sortField] || "").toString().toLowerCase();
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <TeacherLayout>
            <PageHeader title="My Students" subtitle="View all assigned students" />
            <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <SearchBox
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, ID or mobile..."
                        />
                        <button className="btn btn-sm btn-outline-secondary" onClick={loadStudents}>
                            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <Loader text="Loading students..." />
                    ) : paginated.length === 0 ? (
                        <EmptyState title="No Students Found" icon="bi-people" />
                    ) : (
                        <>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("studentId")}>
                                            Student ID <SortIcon field="studentId" />
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("firstName")}>
                                            Full Name <SortIcon field="firstName" />
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("courseId")}>
                                            Course <SortIcon field="courseId" />
                                        </th>
                                        <th style={{ cursor: "pointer" }} onClick={() => handleSort("batchId")}>
                                            Batch <SortIcon field="batchId" />
                                        </th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((student, index) => (
                                        <tr key={student._id || index}>
                                            <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                                            <td className="text-muted small">{student.studentId || "—"}</td>
                                            <td className="fw-semibold">{student.firstName} {student.lastName}</td>
                                            <td>{student.courseId || student.course || "—"}</td>
                                            <td>{student.batchId || student.batch || "—"}</td>
                                            <td>{student.mobile || "—"}</td>
                                            <td>
                                                <span className={`badge ${student.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                                                    {student.status || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                                    <small className="text-muted">
                                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} students
                                    </small>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setPage(p => p - 1)}>Prev</button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}

export default MyStudents;
