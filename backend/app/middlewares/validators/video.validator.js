const { body, validationResult } = require('express-validator');
const path = require('path');

exports.validateVideo = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Video title cannot be empty!'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty!')
    .isLength({ min: 5 })
    .withMessage('Minimum 5-characters description'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];

// Valida solo el tipo de archivo subido
exports.validateFile = [
  (req, res, next) => {
    if (!req.files || !req.files.reelFile) {
      return res.status(400).json({ error: 'You must upload a video file.' });
    }
    const extension = path.extname(req.files.reelFile.name).toLowerCase();
    const allowed = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.ogv'];
    if (!allowed.includes(extension)) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }
    next();
  }
];
