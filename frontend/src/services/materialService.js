import apiRequest, { getFileUrl, BASE_URL, getToken } from "./api";

export async function getMaterials() {
    return await apiRequest("/materials");
}

export async function getMaterialById(id) {
    return await apiRequest(`/materials/${id}`);
}

export async function addMaterial(data) {
    return await apiRequest("/materials", "POST", data);
}

export async function deleteMaterial(id) {
    return await apiRequest(`/materials/${id}`, "DELETE");
}

/**
 * Download a material file via the authenticated streaming endpoint.
 * Uses token in Authorization header (primary) or as query param (fallback).
 */
export async function downloadMaterialFile(id, fileName) {
    if (!id) {
        alert("Cannot download: Material ID is missing.");
        return;
    }

    const token = getToken();
    const url = `${BASE_URL}/materials/${id}/download`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            // Parse the error response for user-friendly message
            let errMsg = `Download failed (HTTP ${response.status})`;
            try {
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const json = await response.json();
                    errMsg = json.message || errMsg;
                }
            } catch (_) { /* ignore parse error */ }
            throw new Error(errMsg);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error("Downloaded file is empty. The file may be missing on the server.");
        }

        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName || "download";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (err) {
        console.error("downloadMaterialFile error:", err);
        // Fallback: open in a new tab with token as query param (browser-compatible)
        if (token) {
            const fallbackUrl = `${url}?token=${encodeURIComponent(token)}`;
            window.open(fallbackUrl, "_blank");
        } else {
            alert(`Download failed: ${err.message || "Unknown error. Please log in and try again."}`);
        }
    }
}

export { getFileUrl, BASE_URL };
