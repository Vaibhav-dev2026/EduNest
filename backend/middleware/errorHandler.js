/**
 * Wraps an async Express route handler so any rejected promise / thrown error
 * is forwarded to next(error) instead of crashing the process or hanging the request.
 */
export function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/** 404 handler for any route that doesn't match — must be registered after all routes. */
export function notFoundHandler(req, res) {
    res.status(404).json({ success: false, message: "Route Not Found" });
}

/**
 * Central Express error handler — must be registered last (4-arg signature).
 * Normalizes MongoDB / validation / auth errors into clean, consistent JSON
 * responses and never leaks raw stack traces to the client.
 */
export function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    console.error("❌ Error:", err && err.message ? err.message : err);

    // Malformed JSON body (express.json() throws a SyntaxError)
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
        return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
    }

    // Invalid MongoDB ObjectId string passed to `new ObjectId(...)`
    if (err.name === "BSONError" || /ObjectId/i.test(err.message || "")) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "A record with this unique value already exists." });
    }

    const status = err.status || err.statusCode || 500;
    const message = status === 500 ? "Internal Server Error. Please try again later." : (err.message || "Something went wrong");

    res.status(status).json({ success: false, message });
}
