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
 * - Sends token in Authorization header (primary path).
 * - Falls back to new-tab only for network-level errors (server unreachable),
 *   NOT for HTTP 4xx/5xx responses (which carry a user-readable error message).
 * - Throws an Error on failure so the calling component can display the message.
 */
export async function downloadMaterialFile(id, fileName) {
    if (!id) {
        throw new Error("Cannot download: Material ID is missing.");
    }

    const token = getToken();
    if (!token) {
        throw new Error("You must be logged in to download files.");
    }

    const url = `${BASE_URL}/materials/${id}/download`;
    let networkError = false;

    try {
        let response;
        try {
            response = await fetch(url, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (fetchErr) {
            // Network-level failure (server unreachable, DNS, CORS, etc.)
            networkError = true;
            throw fetchErr;
        }

        if (!response.ok) {
            // Parse the backend error message for user-friendly display
            let errMsg = `Download failed (HTTP ${response.status}).`;
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
        // Fall back to new tab ONLY for genuine network errors, not HTTP errors.
        if (networkError && token) {
            const fallbackUrl = `${url}?token=${encodeURIComponent(token)}`;
            window.open(fallbackUrl, "_blank");
            return;
        }
        // Re-throw so the UI component can show the error in an alert banner.
        throw err;
    }
}

export { getFileUrl, BASE_URL };
