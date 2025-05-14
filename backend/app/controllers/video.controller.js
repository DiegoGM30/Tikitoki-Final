// const Video = require('../models/video.model');
const Video = require('../models').Video;
const path = require('path');
const reelConfig = require('../config/reel.config');
const thumbnailConfig = require('../config/thumbnail.config');
const encoding = require('../media/encoding');

// Retrieve all videos
module.exports.getAll = async (req, res, next) => {
    // We should query the database
    const videos = await Video.findAll();
    res.status(200).json(videos);
};

// Create a new video
module.exports.create = async (req, res, next) => {
    // The request has already been validated
    const video = await Video.create( { title: req.body.title, creator: req.body.creator, description: req.body.description } );
    res.status(201).json(video);
};

// Get an existing video
module.exports.get = async (req, res, next) => {
    // No validation needed
    const video = await Video.findByPk( req.params.id );
    if (video) {
        res.status(200).json(video);
    }
    else {
        res.status(404).end();
    }
};

// Get the last added video 
module.exports.getLatest = async (req, res, next) => {
    // No validation needed
    // const latest_video = await Video.findLatest();

    const latest_video = await Video.findOne({
        order: [['id', 'DESC']]
    });

    if (latest_video) {
        res.status(200).json(latest_video);
    }
    else {
        res.status(404).end();
    }
};

// Upload the video
module.exports.upload = async (req, res, next) => {
    try {
        const video = await Video.findByPk( req.params.id );
        if (!video) {
            res.status(404).end();
            return;
        }

        // Move video to temporary location and encode it to final location
        const reelFile = req.files.reelFile;
        const extension = path.extname(reelFile.name);
        const reelFileName = reelConfig.NAME_PREFIX + video.id;;
        const uploadedFileName = reelConfig.UPLOADS + reelFileName + extension;
        reelFile.mv(uploadedFileName);

        const outputFile = reelConfig.PUBLIC + reelFileName + '.mp4';
        const destination = await encoding.normalize(uploadedFileName, outputFile);

        // Update video
        await video.update({ reel: destination });
        res.status(200).json(video);
        /*
        // Move reel file
        const reelFile = req.files.reelFile;
        const extension = path.extname(reelFile.name);
        const location = reelConfig.PUBLIC + reelConfig.NAME_PREFIX + video.id + extension;
        reelFile.mv(location);

        // Update video
        await video.update({ reel: location });
        res.status(200).json(video);
        */
    }
    catch (error) {
        return next(error);
    }
};

// Upload the thumbnail image to an existing video
module.exports.uploadthumbnail = async (req, res, next) => {
    try {
        const video = await Video.findByPk( req.params.id );
        if (!video) {
            res.status(404).end();
            return;
        }
        
        // Move thumbnail file to temporary location and encode it to final location
        const thumbnailFile = req.files.thumbnailFile;
        const extension = path.extname(thumbnailFile.name);
        const thumbnailFileName = thumbnailConfig.NAME_PREFIX + video.id;;
        const uploadedFileName = thumbnailConfig.UPLOADS + thumbnailFileName + extension;
        thumbnailFile.mv(uploadedFileName);

        const outputFile = thumbnailConfig.PUBLIC + thumbnailFileName + '.png';
        const destination = await encoding.normalize(uploadedFileName, outputFile);

        // Update video
        await video.update({ thumbnail: destination });
        res.status(200).json(video);
        /*
        // Move thumbnail file
        const thumbnailFile = req.files.thumbnailFile;
        const extension = path.extname(thumbnailFile.name);
        const location = thumbnailConfig.PUBLIC + thumbnailConfig.NAME_PREFIX + video.id + extension;
        thumbnailFile.mv(location);

        // Update video
        await video.update({ thumbnail: location });
        res.status(200).json(video);
        */

    }
    catch (error) {
        return next(error);
    }
};