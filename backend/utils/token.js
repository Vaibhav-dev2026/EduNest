import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "edunest_secure_jwt_token_secret_key_2026";

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) {
        str += "=";
    }
    return Buffer.from(str, "base64").toString("utf8");
}

/**
 * Generates a signed stateless JWT-style token containing user details.
 */
export function generateToken(user) {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payloadData = {
        id: String(user._id || user.id),
        userId: user.userId || "",
        email: (user.email || "").toLowerCase(),
        role: (user.role || "").toLowerCase(),
        referenceId: user.referenceId || "",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days validity
    };
    const payload = base64UrlEncode(JSON.stringify(payloadData));
    const signature = base64UrlEncode(
        crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest()
    );
    return `${header}.${payload}.${signature}`;
}

/**
 * Verifies token signature and returns payload if valid, or null if invalid/expired.
 */
export function verifyToken(token) {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = base64UrlEncode(
        crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest()
    );

    if (signature !== expectedSignature) return null;

    try {
        const decoded = JSON.parse(base64UrlDecode(payload));
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return null; // Token expired
        }
        return decoded;
    } catch (e) {
        return null;
    }
}
