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
 * Falls back to direct URL for cross-origin if token not available.
 */
export async function downloadMaterialFile(id, fileName) {
    const token = getToken();
    const url = `${BASE_URL}/materials/${id}/download`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status}`);
        }

        const blob = await response.blob();
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
        // Fallback: open in new tab
        window.open(url, "_blank");
    }
}

export { getFileUrl, BASE_URL };
