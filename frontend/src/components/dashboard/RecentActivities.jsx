function RecentActivities({
    students = [],
    fees = [],
    attendance = [],
    materials = [],
    notices = []
}) {
    const rawActivities = [];

    // Recent Students
    students.slice(-3).reverse().forEach(s => {
        const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || "Student";
        const course = s.courseName || s.course || "Course";
        rawActivities.push({
            title: `Student ${name} enrolled in ${course}`,
            time: s.joiningDate || "Recently",
            icon: "bi-person-plus-fill",
            color: "text-primary bg-primary-subtle"
        });
    });

    // Recent Fees
    fees.slice(-3).reverse().forEach(f => {
        const studentName = f.studentName || f.student || "Student";
        const amount = f.paidFee || f.paidAmount || f.amount || 0;
        const mode = f.paymentMode ? ` via ${f.paymentMode}` : "";
        rawActivities.push({
            title: `Fee payment received from ${studentName} (₹${amount}${mode})`,
            time: f.paymentDateFormatted || f.paymentDate || "Recently",
            icon: "bi-cash-coin",
            color: "text-success bg-success-subtle"
        });
    });

    // Recent Attendance
    attendance.slice(-3).reverse().forEach(a => {
        const studentOrBatch = a.studentName || a.batch || a.student || "Class";
        rawActivities.push({
            title: `Attendance marked for ${studentOrBatch} (${a.status})`,
            time: a.attendanceDate || "Recently",
            icon: "bi-calendar2-check-fill",
            color: "text-info bg-info-subtle"
        });
    });

    // Recent Study Materials
    materials.slice(-3).reverse().forEach(m => {
        rawActivities.push({
            title: `Study material uploaded: ${m.title}`,
            time: m.uploadDateFormatted || m.uploadDate || "Recently",
            icon: "bi-file-earmark-pdf-fill",
            color: "text-danger bg-danger-subtle"
        });
    });

    // Recent Notices
    notices.slice(-3).reverse().forEach(n => {
        rawActivities.push({
            title: `Notice posted: ${n.title}`,
            time: n.dateFormatted || n.date || "Recently",
            icon: "bi-megaphone-fill",
            color: "text-warning bg-warning-subtle"
        });
    });

    const activities = rawActivities.slice(0, 6);

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-bottom border-secondary border-opacity-10 py-3">
                <div className="d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold text-dark mb-0">
                        <i className="bi bi-clock-history text-primary me-2"></i>
                        Recent Institute Activity
                    </h6>
                    <span className="badge bg-light text-secondary">Realtime</span>
                </div>
            </div>

            <div className="card-body p-0">
                {activities.length === 0 ? (
                    <div className="text-center text-muted py-4">No recent activity recorded</div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {activities.map((act, index) => (
                            <li className="list-group-item px-4 py-3 border-bottom border-light" key={index}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${act.color}`} style={{ width: "36px", height: "36px", flexShrink: 0 }}>
                                        <i className={`bi ${act.icon} fs-6`}></i>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="mb-0 small fw-semibold text-dark text-truncate">
                                            {act.title}
                                        </p>
                                        <span className="text-muted text-xs" style={{ fontSize: "0.75rem" }}>
                                            {act.time}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default RecentActivities;