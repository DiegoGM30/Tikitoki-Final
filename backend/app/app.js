const videos = require('./routes/video.routes');
const cors = require('cors');
const bodyParser = require("body-parser");
const winston = require('winston');
const expressWinston = require('express-winston');
const auth = require('./routes/auth.routes');
const express = require('express');
const path = require('path');
const app = express();

// Configura la carpeta pública
app.use('/public', express.static(path.join(__dirname, 'path/to/public')));

// Resto de la configuración de tu servidor...

// Synchronize models with the database
const db = require("./models");
db.sequelize.sync();

// Logging
app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console()
    ]
  }));

// Avoid CORS issues
app.use(cors());

// Parse requests of content-type: application/json
app.use(bodyParser.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('This is an API to TikiToki');
});

// Videos
app.use('/videos', videos);

// Auth
app.use('/', auth);

module.exports = app;