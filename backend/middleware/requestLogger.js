// requestLogger middleware
// For every request log: [METHOD] [PATH] [TIMESTAMP]
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] [${req.originalUrl || req.url}] [${timestamp}]`);
  next();
};

module.exports = requestLogger;
