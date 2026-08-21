function DashboardCards({ students = [], teachers = [], courses = [], batches = [], fees = [] }) {
    const totalStudentsCount = students.length;
    const activeStudentsCount = students.filter(s => s.status === 'Active').length;

    const totalTeachersCount = teachers.length;

    const activeCoursesCount = courses.filter(c => (c.status || 'Active') === 'Active').length;
    const runningBatchesCount = batches.length;

    const totalFeesCollected = fees.reduce((sum, f) => {
        const val = Number(f.paidFee || f.paidAmount || f.amount || 0);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const cards = [
        {
            title: "Total Students",
            value: totalStudentsCount.toLocaleString(),
            trend: `${activeStudentsCount} Active`,
            trendUp: true,
            icon: "bi-people-fill",
            colorClass: "icon-purple"
        },
        {
            title: "Faculty & Teachers",
            value: totalTeachersCount.toLocaleString(),
            trend: "Faculty members",
            trendUp: true,
            icon: "bi-person-badge-fill",
            colorClass: "icon-green"
        },
        {
            title: "Active Courses",
            value: activeCoursesCount.toLocaleString(),
            trend: `${runningBatchesCount} Batches running`,
            trendUp: true,
            icon: "bi-book-fill",
            colorClass: "icon-amber"
        },
        {
            title: "Fees Collected",
            value: `₹${totalFeesCollected.toLocaleString('en-IN')}`,
            trend: `${fees.length} Total Receipts`,
            trendUp: true,
            icon: "bi-currency-rupee",
            colorClass: "icon-rose"
        }
    ];

    return (
        <div className="row g-3 g-lg-4 mb-4">
            {cards.map((card, index) => (
                <div className="col-12 col-md-6 col-lg-3" key={index}>
                    <div className="stat-card">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="text-muted fw-semibold small">
                                {card.title}
                            </span>
                            <div className={`stat-icon-wrapper ${card.colorClass}`}>
                                <i className={`bi ${card.icon}`}></i>
                            </div>
                        </div>

                        <div className="d-flex align-items-baseline justify-content-between">
                            <h3 className="fw-extrabold text-dark mb-0" style={{ letterSpacing: "-0.02em" }}>
                                {card.value}
                            </h3>
                            <span className="stat-trend trend-up">
                                <i className="bi bi-arrow-up-short"></i>
                                {card.trend}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DashboardCards;