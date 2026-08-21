function Button({
    type = "button",
    text,
    children,
    className = "btn btn-primary",
    onClick,
    disabled = false,
    icon
}) {
    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <i className={`bi ${icon}`}></i>}
            <span>{children || text}</span>
        </button>
    );
}

export default Button;