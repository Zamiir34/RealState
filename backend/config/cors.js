const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[\w.-]+\.netlify\.app$/.test(origin)) return true;
  return false;
};

const setCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
};

// Runs before all other middleware so preflight and errors always get CORS headers.
const corsMiddleware = (req, res, next) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] || 'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  next();
};

const corsOptions = {
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

module.exports = { corsMiddleware, corsOptions, isAllowedOrigin, setCorsHeaders };
