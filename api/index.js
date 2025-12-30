"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_js_1 = require("../backend/config/env.js");
const index_js_1 = __importDefault(require("../backend/routes/index.js"));
const errorHandler_js_1 = require("../backend/middleware/errorHandler.js");
const database_js_1 = require("../backend/config/database.js");
const app = (0, express_1.default)();
// Trust proxy for Vercel
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = env_js_1.env.ALLOWED_ORIGINS
    ? env_js_1.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [env_js_1.env.FRONTEND_URL];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(env_js_1.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env_js_1.env.RATE_LIMIT_MAX),
    message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', async (_req, res) => {
    try {
        await database_js_1.pool.query('SELECT 1');
        res.json({ status: 'healthy', database: 'connected' });
    }
    catch {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});
// API routes
app.use('/api', index_js_1.default);
// Error handling
app.use(errorHandler_js_1.notFound);
app.use(errorHandler_js_1.errorHandler);
// Export for Vercel serverless
exports.default = app;
//# sourceMappingURL=index.js.map