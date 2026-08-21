import React from "react";

function Input({

    type = "text",

    name,

    id,

    value,

    placeholder,

    onChange,

    onBlur,

    onFocus,

    disabled = false,

    readOnly = false,

    required = false,

    className = "",

    autoComplete = "off",

    min,

    max,

    step,

    maxLength,

    minLength,

    accept

}) {

    return (

        <input

            type={type}

            name={name}

            id={id || name}

            value={value}

            placeholder={placeholder}

            onChange={onChange}

            onBlur={onBlur}

            onFocus={onFocus}

            disabled={disabled}

            readOnly={readOnly}

            required={required}

            autoComplete={autoComplete}

            min={min}

            max={max}

            step={step}

            maxLength={maxLength}

            minLength={minLength}

            accept={accept}

            className={`form-control ${className}`}

        />

    );

}

export default Input;