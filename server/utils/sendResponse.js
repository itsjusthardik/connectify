const sendResponse = (res, statusCode, success, message, data = {}) => {
  if (Array.isArray(data)) {
    // If data is an array, wrap it
    return res.status(statusCode).json({ success, message, data });
  }
  res.status(statusCode).json({ success, message, ...data });
};

export default sendResponse;
