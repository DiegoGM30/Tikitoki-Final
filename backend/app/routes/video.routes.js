const express = require('express');
const router = express.Router();
const controller = require("../controllers/video.controller.js");
const validator = require('../middlewares/validators/video.validator');
const fileUpload = require('express-fileupload');

// Parse requests of content-type: multipart/form-data
router.use(fileUpload({ createParentPath: true }))

// Get all videos
router.get('/', controller.getAll);

// Create a new video
router.post('/', validator.create, controller.create);

// Get the latest video
router.get('/latest', controller.getLatest);

// Get a single video
router.get('/:id', controller.get);

// Upload a video
router.post('/:id/upload', validator.upload, controller.upload)

// Upload a video thumbnail
router.post('/:id/uploadthumbnail', validator.uploadthumbnail, controller.uploadthumbnail)

module.exports = router;