import apiRequest, { getFileUrl, BASE_URL } from "./api";

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

export { getFileUrl, BASE_URL };
