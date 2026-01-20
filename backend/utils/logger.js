function logInfo(message, data = {}) {
  console.log(`[INFO] ${message}`, Object.keys(data).length > 0 ? data : "");
}

function logError(message, error = {}) {
  console.error(`[ERROR] ${message}`, error);
}

function logWarn(message, data = {}) {
  console.warn(`[WARN] ${message}`, Object.keys(data).length > 0 ? data : "");
}

module.exports = {
  logInfo,
  logError,
  logWarn,
};

