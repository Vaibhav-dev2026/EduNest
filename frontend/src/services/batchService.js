import apiRequest from "./api";

export async function getBatches() {
    return await apiRequest("/batches");
}

export async function getBatchById(id) {
    return await apiRequest(`/batches/${id}`);
}

export async function addBatch(batchData) {
    return await apiRequest("/batches", "POST", batchData);
}

export async function updateBatch(id, batchData) {
    return await apiRequest(`/batches/${id}`, "PUT", batchData);
}

export async function deleteBatch(id) {
    return await apiRequest(`/batches/${id}`, "DELETE");
}
