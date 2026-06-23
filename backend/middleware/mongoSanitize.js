const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitize(obj[key]);
    }
  }
  return obj;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);

  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.query[key];
      } else if (typeof req.query[key] === 'object' && req.query[key] !== null) {
        sanitize(req.query[key]);
      }
    }
  }

  next();
};

module.exports = mongoSanitize;
