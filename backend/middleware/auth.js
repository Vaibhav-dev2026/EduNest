import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";
import { verifyToken } from "../utils/token.js";

/**
 * Express middleware factory: authenticate the request and (optionally)
 * restrict it to a set of roles. Attaches the full, fresh user document
 * from MongoDB to req.user (never trusts stale data from the token alone).
 *
 * Usage:
 *   router.get("/students", authenticate(), getStudents);
 *   router.post("/students", authenticate(["admin"]), addStudent);
 */
export function authenticate(allowedRoles = null) {
    return async function (req, res, next) {
        try {
            const authHeader = req.headers["authorization"]
                || req.headers["Authorization"]
                || req.headers["x-access-token"]
                || req.headers["x-auth-token"];

            let token = null;

            if (authHeader && typeof authHeader === "string") {
                token = authHeader.replace(/^Bearer\s+/i, "").replace(/^"(.*)"$/, "$1").trim();
            } else if (req.query && req.query.token) {
                token = String(req.query.token).replace(/^Bearer\s+/i, "").replace(/^"(.*)"$/, "$1").trim();
            }

            if (!token) {
                return res.status(401).json({ success: false, message: "Unauthorized: Missing authentication token" });
            }

            const payload = verifyToken(token);
            if (!payload) {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
            }

            const db = getDB();
            let query = null;
            if (payload.id && ObjectId.isValid(payload.id)) {
                query = { _id: new ObjectId(payload.id) };
            } else if (payload.email) {
                query = { email: String(payload.email).toLowerCase() };
            } else {
                return res.status(401).json({ success: false, message: "Unauthorized: Invalid token payload" });
            }

            const user = await db.collection("users").findOne(query);

            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized: User account not found" });
            }

            if (user.status !== "Active") {
                return res.status(403).json({ success: false, message: "Forbidden: User account is inactive" });
            }

            if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
                const userRole = (user.role || "").toLowerCase();
                const allowed = allowedRoles.map(r => String(r).toLowerCase());
                if (!allowed.includes(userRole)) {
                    return res.status(403).json({ success: false, message: "Forbidden: Access denied for your role" });
                }
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    };
}
