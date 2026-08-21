function Statistics({ students = [], courses = [] }) {
    const colorClasses = ["bg-primary", "bg-success", "bg-warning", "bg-info", "bg-danger"];

    // Count students per course name or ID
    const courseCountsMap = {};
    students.forEach(s => {
        const key = s.courseId || s.courseName || s.course || "Other";
        courseCountsMap[key] = (courseCountsMap[key] || 0) + 1;
    });

    const totalStudents = students.length || 1;

    let stats = [];

    if (courses.length > 0) {
        stats = courses.map((c, index) => {
            const courseName = c.courseName || c.name || c.courseId || "Course";
            const count = courseCountsMap[courseName] || courseCountsMap[c.courseId] || courseCountsMap[c._id] || 0;
            const pct = Math.round((count / totalStudents) * 100);
            return {
                label: courseName,
                count: `${count} Students`,
                pct: pct,
                color: colorClasses[index % colorClasses.length]
            };
        });
    } else {
        // Fallback from grouped student courses if courses collection is empty
        const keys = Object.keys(courseCountsMap);
        stats = keys.map((key, index) => {
            const count = courseCountsMap[key];
            const pct = Math.round((count / totalStudents) * 100);
            return {
                label: key,
                count: `${count} Students`,
                pct: pct,
                color: colorClasses[index % colorClasses.length]
            };
        });
    }

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white border-bottom border-secondary border-opacity-10 py-3">
                <div className="d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold text-dark mb-0">
                        <i className="bi bi-bar-chart-line-fill text-primary me-2"></i>
                        Course Enrollment Distribution
                    </h6>
                    <span className="badge bg-light text-secondary">Active</span>
                </div>
            </div>

            <div className="card-body">
                {stats.length === 0 ? (
                    <div className="text-center text-muted py-4">No Course Enrollment Data</div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {stats.map((item, index) => (
                            <div key={index}>
                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                    <span className="text-dark">{item.label}</span>
                                    <span className="text-muted">{item.count}</span>
                                </div>
                                <div className="progress" style={{ height: "8px", borderRadius: "4px" }}>
                                    <div
                                        className={`progress-bar ${item.color}`}
                                        role="progressbar"
                                        style={{ width: `${Math.max(item.pct, 5)}%` }}
                                        aria-valuenow={item.pct}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Statistics;