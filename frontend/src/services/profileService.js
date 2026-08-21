import apiRequest, { getFileUrl, BASE_URL } from "./api";
import { getCurrentUser } from "./authService";

export async function getProfile() {
    const res = await apiRequest("/profile");
    return res.profile || res.data?.profile || res.user || res;
}

export async function updateProfile(data) {
    const res = await apiRequest("/profile", "PUT", data);
    const updatedUser = res.user || res.profile || res.data?.profile || res;
    if (updatedUser) {
        // Synchronize updated user into sessionStorage and localStorage
        const currentUser = getCurrentUser() || {};
        const mergedUser = {
            ...currentUser,
            ...updatedUser
        };
        sessionStorage.setItem("user", JSON.stringify(mergedUser));
        localStorage.setItem("user", JSON.stringify(mergedUser));

        // Dispatch a custom event so components listening can re-render immediately
        window.dispatchEvent(new Event("edunest_user_updated"));
    }
    return res;
}

export { getFileUrl, BASE_URL };
