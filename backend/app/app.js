// File: backend/app/app.js
const express        = require('express');
const path           = require('path');
const cors           = require('cors');
const bodyParser     = require('body-parser');
const fileUpload     = require('express-fileupload');
const winston        = require('winston');
const expressWinston = require('express-winston');

const videosRoutes = require('./routes/video.routes');
const authRoutes   = require('./routes/auth.routes');
const db = require('./models'); // Require database models for sync

const app = express();

/* -----------------------  Middlewares globales  ----------------------- */

// CORS para peticiones API (JSON, etc.)
// Configure CORS more restrictively in production if needed
app.use(cors({ 
  origin: true, // Allows all origins. For production, specify allowed origins.
  credentials: true 
}));

// Logs HTTP - Placed before routes to log incoming requests
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })],
    meta: true, // Log request metadata (optional)
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms", // Customize log message
    colorize: true
  })
);

// Body parsers para JSON y x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Manejo de multipart/form-data (subida de archivos)
// Configure limits as needed, e.g., fileSize
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // Example: 50MB limit
  useTempFiles: true, // Uses temporary files for uploads, good for larger files
  tempFileDir: '/tmp/', // Specify a temporary directory
  abortOnLimit: true, // Abort request if file size limit is exceeded
}));

/* --------------------  Rutas estáticas con CORS  ---------------------- */

// /public  (si se usa para archivos estáticos genéricos)
// Ensure this path is correct or remove if not used.
const publicPath = path.join(__dirname, '../public_files'); // Example: if you have a 'public_files' dir
// fs.mkdirSync(publicPath, { recursive: true }); // Create if it doesn't exist (optional)
app.use(
  '/public',
  // cors({ origin: true }), // Already handled by global CORS, but can be more specific here if needed
  (req, res, next) => {
    // Cross-Origin-Resource-Policy is useful if /public serves HTML that embeds other resources
    // For direct asset serving (images, CSS, JS bundles), it's often not strictly necessary if CORS is open.
    // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
    next();
  },
  express.static(publicPath)
);

// /users  (vídeos, thumbnails, segmentos DASH)
// This serves files from the 'volumes/users' directory.
const userVolumesPath = path.join(__dirname, '../volumes/users');
// fs.mkdirSync(userVolumesPath, { recursive: true }); // Ensure it exists (usually handled by controller on user/video creation)
app.use(
  '/users',
  // cors({ origin: true }), // Already handled by global CORS
  (req, res, next) => {
    // For DASH segments (m4s, mpd) and thumbnails (jpg), 'cross-origin' is generally safe.
    // It allows these resources to be embedded/fetched by other origins (your frontend).
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(userVolumesPath)
);

/* ---------------------  Sincronizar base de datos  -------------------- */
// Consider if 'alter: true' is safe for production.
// For development, it's okay. For production, migrations are preferred.
db.sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('Database synced successfully. (alter: true)');
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });

/* ---------------------------  Rutas API  ------------------------------ */

app.get('/', (req, res) => {
  res.send('Welcome to the TikiToki API');
});

// API Routes
app.use('/videos', videosRoutes);
app.use('/', authRoutes); // For /login, /signup

/* ------------------- Global Error Handler (Optional but Recommended) --------------- */
app.use((err, req, res, next) => {
  console.error("🔴 Global Error Handler Caught:", err.stack || err);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // In a production environment, you might not want to send the stack trace
  // or detailed error messages to the client.
  res.status(statusCode).json({
    error: message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


/* ---------------------------  Export App  ----------------------------- */
module.exports = app;
