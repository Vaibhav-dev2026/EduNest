import { Server } from "socket.io";
import { verifyToken } from "../utils/token.js";
import { getDB } from "../config/database.js";
import { ObjectId } from "mongodb";

let io = null;

/**
 * Initializes Socket.IO on the existing HTTP server instance.
 */
export function initSocket(server) {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://edunest-xi.vercel.app",
    ].filter(Boolean);

    io = new Server(server, {
        cors: {
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                if (allowedOrigins.includes(origin)) return callback(null, true);
                return callback(null, true); // Allow configured / dev origins
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
        pingTimeout: 30000,
        pingInterval: 25000,
    });

    // Authentication middleware for Socket.IO connections
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "") ||
                socket.handshake.query?.token;

            if (!token) {
                // Allow unauthenticated connection but with guest status
                socket.user = null;
                return next();
            }

            const cleanToken = String(token).replace(/^Bearer\s+/i, "").replace(/^"(.*)"$/, "$1").trim();
            const payload = verifyToken(cleanToken);

            if (!payload) {
                // Token invalid
                socket.user = null;
                return next();
            }

            const db = getDB();
            let query = null;
            if (payload.id && ObjectId.isValid(payload.id)) {
                query = { _id: new ObjectId(payload.id) };
            } else if (payload.email) {
                query = { email: String(payload.email).toLowerCase() };
            }

            if (query && db) {
                const user = await db.collection("users").findOne(query);
                if (user) {
                    socket.user = {
                        _id: user._id.toString(),
                        userId: user.userId || "",
                        role: (user.role || "").toLowerCase(),
                        email: user.email || "",
                        referenceId: user.referenceId || "",
                    };
                }
            }

            return next();
        } catch (err) {
            console.error("Socket auth error:", err.message);
            return next();
        }
    });

    io.on("connection", (socket) => {
        const user = socket.user;

        if (user) {
            const userRole = user.role;
            // Join role-based room
            socket.join(`role:${userRole}`);

            // Join personal user room
            socket.join(`user:${user._id}`);
            if (user.referenceId) {
                socket.join(`ref:${user.referenceId}`);
            }

            // General broadcast room for all authenticated users
            socket.join("authenticated");
        }

        socket.on("disconnect", () => {
            // Clean up
        });
    });

    return io;
}

/**
 * Returns the current Socket.IO server instance.
 */
export function getIO() {
    return io;
}

/**
 * Emits an event safely to relevant rooms or all authenticated clients.
 *
 * @param {string} event - Name of the event, e.g. "student:created"
 * @param {object} data - Minimal synchronization metadata
 * @param {object} options - Target options: { role, userId, refId, courseId, batchId }
 */
export function emitEvent(event, data = {}, options = {}) {
    if (!io) return;

    try {
        const payload = {
            event,
            ...data,
            timestamp: Date.now(),
        };

        if (options.role) {
            // e.g. "admin", "teacher", "student"
            io.to(`role:${options.role}`).emit(event, payload);
        } else if (options.userId) {
            io.to(`user:${options.userId}`).emit(event, payload);
        } else if (options.refId) {
            io.to(`ref:${options.refId}`).emit(event, payload);
        } else {
            // Broadcast to all authenticated clients and connected sockets
            io.emit(event, payload);
        }
    } catch (err) {
        console.error(`Failed to emit real-time event ${event}:`, err.message);
    }
}
