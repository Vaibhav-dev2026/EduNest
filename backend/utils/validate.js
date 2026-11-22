// EduNest backend validation helpers (no external dependencies)

export function validateMobile(value, required = false) {
  const v = String(value || "").trim();
  if (!v) return required ? "Mobile number is required." : null;
  if (!/^[0-9]{10}$/.test(v)) return "Mobile number must contain exactly 10 digits.";
  return null;
}

export function validateEmail(value, required = true) {
  const v = String(value || "").trim();
  if (!v) return required ? "Email address is required." : null;
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return "Please enter a valid email address.";
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || String(value).trim() === "") return `${fieldName} is required.`;
  return null;
}

export function validateNumeric(value, fieldName, { required = false, min = 0 } = {}) {
  const str = String(value ?? "").trim();
  if (!str) return required ? `${fieldName} is required.` : null;
  const n = Number(str);
  if (isNaN(n) || !isFinite(n)) return `${fieldName} must be a valid number.`;
  if (n < min) return `${fieldName} must be at least ${min}.`;
  return null;
}

export function collectErrors(errorMap) {
  const errs = Object.values(errorMap).filter(Boolean);
  return errs.length > 0 ? errs.join(" ") : null;
}
