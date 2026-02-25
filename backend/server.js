const express = require('express')
const mongoose = require('mongoose');
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config();
require('./config/passport')
const passportLib = require('passport');

const response = require('./middleware/response');



const app = express();

//helmet is a security middleware for Express 
//It helps protect your app by settings various HTTP headers
app.use(helmet());

//morgan is an HTTP request logger middleware
app.use(morgan('dev'))
app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean) || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//used response
app.use(response);


//Initialize passport
app.use(passportLib.initialize());

//Mongodb connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctor', require('./routes/doctor'))
app.use('/api/patient', require('./routes/patient'))
app.use('/api/appointment', require('./routes/appointment'))
app.use('/api/payment', require('./routes/payment'))

app.get('/health', (req, res) => res.ok({ time: new Date().toISOString() }, 'OK'))


// Serve Next.js frontend in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const { spawn } = require('child_process');

    const standaloneDir = path.join(__dirname, '..', 'frontend', '.next', 'standalone');
    const NEXT_PORT = 3000;

    // Start the Next.js standalone server on an internal port
    console.log('Starting Next.js standalone server...');
    console.log('Standalone dir:', standaloneDir);

    const nextServer = spawn('node', [path.join('frontend', 'server.js')], {
        cwd: standaloneDir,
        env: { ...process.env, PORT: String(NEXT_PORT), HOSTNAME: '0.0.0.0' },
        stdio: 'inherit',
    });

    nextServer.on('error', (err) => {
        console.error('Failed to start Next.js server:', err);
    });

    // Serve Next.js static assets directly (not included in standalone)
    app.use('/_next/static', express.static(path.join(__dirname, '..', 'frontend', '.next', 'static')));

    // Serve public folder assets
    const publicDir = path.join(__dirname, '..', 'frontend', 'public');
    app.use(express.static(publicDir));

    // Wait for Next.js to boot, then proxy all non-API routes
    const waitAndProxy = () => {
        const http = require('http');
        const check = () => {
            http.get(`http://127.0.0.1:${NEXT_PORT}/`, (res) => {
                console.log(`Next.js server ready (status: ${res.statusCode})`);
                app.use('/', createProxyMiddleware({
                    target: `http://127.0.0.1:${NEXT_PORT}`,
                    changeOrigin: true,
                    ws: true,
                }));
                console.log('Next.js proxy configured');
            }).on('error', (err) => {
                console.log(`Waiting for Next.js server... (${err.message})`);
                setTimeout(check, 1000);
            });
        };
        check();
    };
    waitAndProxy();

    process.on('exit', () => nextServer.kill());
    process.on('SIGTERM', () => { nextServer.kill(); process.exit(0); });
}


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);

    // Keep-alive: ping /health every 14 minutes to prevent Render free tier from sleeping
    if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
        const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
        setInterval(async () => {
            try {
                const url = `${process.env.RENDER_EXTERNAL_URL}/health`;
                const res = await fetch(url);
                console.log(`Keep-alive ping: ${res.status} at ${new Date().toISOString()}`);
            } catch (err) {
                console.error('Keep-alive ping failed:', err.message);
            }
        }, PING_INTERVAL);
        console.log('Keep-alive ping enabled (every 14 min)');
    }
});