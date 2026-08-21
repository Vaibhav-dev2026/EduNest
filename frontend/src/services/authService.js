// Backend API URL
// Local development:
// REACT_APP_API_URL=http://localhost:5000
//
// Production (Vercel):
// REACT_APP_API_URL=https://edunest-uhlb.onrender.com

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to login");
    }

    return data;
}

export async function signup(userData) {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create account"
        );
    }

    return data;
}

export function getToken() {
    return (
        sessionStorage.getItem("token") ||
        localStorage.getItem("token")
    );
}

export function getCurrentUser() {
    const userStr =
        sessionStorage.getItem("user") ||
        localStorage.getItem("user");

    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function setCurrentSession(token, user) {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("user", JSON.stringify(user));

    localStorage.setItem("token", token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("user");

    const localUser = localStorage.getItem("user");

    if (localUser) {
        try {
            const parsed = JSON.parse(localUser);
            const user = getCurrentUser();

            if (user && parsed.id === user.id) {
                localStorage.removeItem("token");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("user");
            }
        } catch (e) {
            console.error("Failed to clear local session:", e);
        }
    }

    window.location.href = "/login";
}
