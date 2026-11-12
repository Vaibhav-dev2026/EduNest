import { io } from "socket.io-client";
import { BASE_URL, getToken } from "./api";

let socket = null;

/**
 * Returns or creates the singleton Socket.IO connection.
 */
export function getSocket() {
    if (socket) return socket;

    const token = getToken();

    // Determine the socket server URL
    const socketUrl = BASE_URL.replace(/\/api\/?$/, "");

    socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
    });

    socket.on("connect", () => {
        // Re-authenticate if token changed
        const currentToken = getToken();
        if (currentToken && socket.auth?.token !== currentToken) {
            socket.auth = { token: currentToken };
        }
    });

    socket.on("connect_error", (err) => {
        // Connection error
    });

    return socket;
}

/**
 * Subscribes a callback to a real-time event.
 * Returns an unsubscribe function.
 *
 * @param {string} event - Name of the event, e.g. "student:created"
 * @param {function} callback - Handler called when the event fires
 * @returns {function} unsubscribe - Call to clean up listener
 */
export function subscribeToEvent(event, callback) {
    const s = getSocket();

    const handler = (data) => {
        try {
            callback(data);
        } catch (err) {
            console.error(`Error in real-time handler for ${event}:`, err);
        }
    };

    s.on(event, handler);

    return () => {
        s.off(event, handler);
    };
}

/**
 * Subscribes to multiple events with a single callback (useful for invalidating queries).
 *
 * @param {string[]} events - List of event names
 * @param {function} callback - Callback triggered when any of these events occurs
 * @returns {function} unsubscribeAll - Cleans up all listeners
 */
export function subscribeToEvents(events, callback) {
    const unsubs = events.map(e => subscribeToEvent(e, callback));
    return () => {
        unsubs.forEach(u => u());
    };
}

/**
 * Disconnects and resets the socket instance (e.g. on logout).
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
