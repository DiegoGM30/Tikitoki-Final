const express = require('express');
const videos = require('./routes/video.routes');
const cors = require('cors');
const bodyParser = require("body-parser");
const winston = require('winston');
const expressWinston = require('express-winston');
const auth = require('./routes/auth.routes');

const app = express();

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