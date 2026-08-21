import crypto from "crypto";

/**
 * Hashes a plain-text password using scrypt (built into Node's crypto module —
 * no extra dependency needed). Stored format: "salt:hash" (both hex).
 */
export function hashPassword(plainPassword) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(String(plainPassword), salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

/**
 * Verifies a plain-text password against a stored hash produced by hashPassword().
 * Falls back to a plain-text comparison for legacy accounts created before hashing
 * was introduced, so existing users aren't locked out; those accounts are
 * transparently upgraded to a hash on next successful login (handled by the caller).
 */
export function verifyPassword(plainPassword, storedPassword) {
    if (!storedPassword || typeof storedPassword !== "string") return false;

    if (storedPassword.includes(":")) {
        const [salt, hash] = storedPassword.split(":");
        if (!salt || !hash) return false;
        try {
            const attempt = crypto.scryptSync(String(plainPassword), salt, 64).toString("hex");
            const a = Buffer.from(attempt, "hex");
            const b = Buffer.from(hash, "hex");
            if (a.length !== b.length) return false;
            return crypto.timingSafeEqual(a, b);
        } catch {
            return false;
        }
    }

    // Legacy plain-text password (pre-existing accounts / seed data)
    return storedPassword === plainPassword;
}

export function isHashed(storedPassword) {
    return typeof storedPassword === "string" && storedPassword.includes(":") && storedPassword.split(":").length === 2;
}
