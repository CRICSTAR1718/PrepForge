const successResponse = (message, data = {}) => ({
    success: true,
    message,
    ...data,
});

const errorResponse = (message, errors = null) => ({
    success: false,
    message,
    ...(errors && { errors }),
});

export { successResponse, errorResponse };

export function apiResponse(success, message, data = null, error = null) {
    const response = { success, message };
    if (data !== null) response.data = data;
    if (error !== null) response.error = error;
    return response;
}