export const BASE_URL = "http://localhost:5000";

export function getToken() {
    let token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
        try {
            const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
            if (userStr) {
                const parsed = JSON.parse(userStr);
                if (parsed && (parsed.token || parsed.authToken)) {
                    token = parsed.token || parsed.authToken;
                }
            }
        } catch (e) {}
    }
    if (token && typeof token === "string") {
        token = token.replace(/^"(.*)"$/, "$1").trim();
    }
    return token || null;
}

export function getFileUrl(path) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
}

async function apiRequest(endpoint, method = "GET", body = null) {
    const token = getToken();

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers = {};

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            // Handle HTTP 401 Unauthorized — session invalid/expired
            if (response.status === 401 && !endpoint.startsWith("/login") && !endpoint.startsWith("/signup")) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("isLoggedIn");
                sessionStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("user");
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }

            throw new Error(data.message || "Something went wrong.");
        }

        return data;
    } catch (error) {
        console.error("API Error :", error.message);
        throw error;
    }
}

export default apiRequest;