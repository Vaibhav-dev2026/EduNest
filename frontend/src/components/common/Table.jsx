function Table({ children }) {
    return (
        <div className="table-responsive rounded-3 border border-secondary border-opacity-15 shadow-sm">
            <table className="table table-hover align-middle mb-0">
                {children}
            </table>
        </div>
    );
}

export default Table;