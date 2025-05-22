const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const videoValidator = require('../middlewares/validators/video.validator');
const videoController = require('../controllers/video.controller');

router.post(
  '/',
  auth,
  videoValidator.validateVideo,
  videoValidator.validateFile,
  videoController.createWithFile
);

router.get('/', videoController.getAll);
router.get('/latest', videoController.getLatest);
router.get('/:id', videoController.get);

module.exports = router;
