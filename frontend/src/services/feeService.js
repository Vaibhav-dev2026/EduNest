import apiRequest from "./api";

export async function getFees() {
    return await apiRequest("/fees");
}

export async function getFeeById(id) {
    return await apiRequest(`/fees/${id}`);
}

export async function addFee(data) {
    return await apiRequest("/fees", "POST", data);
}

export async function updateFee(id, data) {
    return await apiRequest(`/fees/${id}`, "PUT", data);
}

export async function deleteFee(id) {
    return await apiRequest(`/fees/${id}`, "DELETE");
}
