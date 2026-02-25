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

    const nextDir = path.join(__dirname, '..', 'frontend', '.next', 'standalone');

    // Start the Next.js standalone server on an internal port
    const NEXT_PORT = 3000;
    const nextServer = spawn('node', ['frontend/server.js'], {
        cwd: nextDir.replace('/frontend/server.js', '').replace('\\frontend\\server.js', ''),
        env: { ...process.env, PORT: NEXT_PORT, HOSTNAME: '0.0.0.0' },
        stdio: 'inherit',
        shell: true,
    });

    // Actually, let's use a simpler approach - serve static files + proxy
    // Serve Next.js static assets
    app.use('/_next/static', express.static(path.join(__dirname, '..', 'frontend', '.next', 'static')));
    app.use('/favicon.ico', express.static(path.join(__dirname, '..', 'frontend', 'public', 'favicon.ico')));

    // Proxy all other non-API requests to Next.js standalone server
    setTimeout(() => {
        app.use('/', createProxyMiddleware({
            target: `http://127.0.0.1:${NEXT_PORT}`,
            changeOrigin: true,
            ws: true,
        }));
        console.log('Next.js proxy configured');
    }, 2000); // Wait for Next.js server to start

    process.on('exit', () => nextServer.kill());
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