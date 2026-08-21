function PageHeader({ title, subtitle }) {
    return (
        <div className="page-header-container">
            <h3 className="page-header-title mb-1 fs-4">
                {title}
            </h3>
            {subtitle && (
                <p className="page-header-subtitle mb-0">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default PageHeader;