// EduNest shared frontend validation helpers

export function validateMobile(value, required = false) {
  const v = String(value || "").trim();
  if (!v) return required ? "Mobile number is required." : "";
  if (!/^[0-9]{10}$/.test(v)) return "Mobile number must contain exactly 10 digits.";
  return "";
}

export function validateEmail(value, required = true) {
  const v = String(value || "").trim();
  if (!v) return required ? "Email address is required." : "";
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return "Please enter a valid email address.";
  return "";
}

export function validateRequired(value, fieldName) {
  if (!value || String(value).trim() === "") return `${fieldName} is required.`;
  return "";
}

export function validateDate(value, fieldName, { allowFuture = true, required = false } = {}) {
  if (!value) return required ? `${fieldName} is required.` : "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return `${fieldName} must be a valid date.`;
  if (!allowFuture && d > new Date()) return `${fieldName} cannot be in the future.`;
  return "";
}

export function validateNumeric(value, fieldName, { required = false, min = 0 } = {}) {
  if (value === "" || value === null || value === undefined) {
    return required ? `${fieldName} is required.` : "";
  }
  const n = Number(value);
  if (isNaN(n) || !isFinite(n)) return `${fieldName} must be a valid number.`;
  if (n < min) return `${fieldName} must be at least ${min}.`;
  return "";
}
