function SearchBox({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="input-group shadow-sm rounded-md overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted ps-3">
                <i className="bi bi-search"></i>
            </span>
            <input
                type="search"
                className="form-control border-start-0 ps-2"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={{ height: "42px" }}
            />
        </div>
    );
}

export default SearchBox;