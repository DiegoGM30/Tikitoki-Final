// File: backend/app/controllers/video.controller.js

const fs = require('fs');
const path = require('path');
const { Video, User } = require('../models'); // Destructure models directly
const encoding = require('../media/encoding');
// const ffmpeg = require('fluent-ffmpeg'); // Not directly used here if encoding.js handles it

// Helper para construir la respuesta pública de un vídeo
async function makePublicVideo(videoInstance) {
  // Ensure creator data is loaded if it wasn't eagerly.
  // If videoInstance.creator is already populated by an include, this won't re-fetch.
  let creator = videoInstance.creator;
  if (!creator && videoInstance.creatorId) {
    creator = await User.findByPk(videoInstance.creatorId, { attributes: ['id', 'username'] });
  }

  const creatorUsername = creator ? creator.username : 'Unknown';
  const creatorId = videoInstance.creatorId;
  const videoId = videoInstance.id;

  // Determine the extension of the original video for the direct videoPath
  // This assumes the original video is stored with its original extension.
  // If you normalize all uploads to a specific format (e.g., .mp4) before storing the "original",
  // then you can hardcode that extension.
  // For now, let's assume we need to find it or default to .mp4.
  // This part is tricky without knowing the exact stored original file name.
  // Let's default to .mp4 for simplicity in this example, as the original path is used less
  // once DASH is available.
  const originalVideoExtension = '.mp4'; // Or determine dynamically if possible

  return {
    id: videoId,
    title: videoInstance.title,
    description: videoInstance.description,
    creator: { id: creatorId, username: creatorUsername },
    // This path should point to the original, non-DASH video if you intend to serve it directly
    videoPath: `/users/${creatorId}/${videoId}/video${originalVideoExtension}`,
    thumbnailPath: `/users/${creatorId}/${videoId}/thumbnail.jpg`, // Consistent with generation
    manifestPath: `/users/${creatorId}/${videoId}/dash/manifest.mpd` // Consistent with generation
  };
}


// Listar todos los vídeos (incluye rutas públicas)
module.exports.getAll = async (req, res, next) => {
  try {
    const videos = await Video.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']] // Optional: order by creation date
    });
    // Use Promise.all to handle the async nature of makePublicVideo if it involves db calls
    const publicVideos = await Promise.all(videos.map(v => makePublicVideo(v)));
    res.status(200).json(publicVideos);
  } catch (err) {
    console.error("Error in getAll videos:", err);
    next(err);
  }
};

// Obtener un vídeo por ID (incluye rutas públicas)
module.exports.get = async (req, res, next) => {
  try {
    const video = await Video.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.status(200).json(await makePublicVideo(video));
  } catch (err) {
    console.error(`Error in get video by ID (${req.params.id}):`, err);
    next(err);
  }
};

// Obtener el último vídeo subido (incluye rutas públicas)
module.exports.getLatest = async (req, res, next) => {
  try {
    const video = await Video.findOne({
      order: [['createdAt', 'DESC']], // Use createdAt for latest, or stick to 'id' if preferred
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });
    if (!video) {
      return res.status(404).json({ error: 'No videos found' });
    }
    res.status(200).json(await makePublicVideo(video));
  } catch (err) {
    console.error("Error in getLatest video:", err);
    next(err);
  }
};

// Subida de vídeo, generación de thumbnail y MPEG-DASH
module.exports.createWithFile = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    // Validation for title and description is handled by video.validator.js
    // File validation (reelFile existence and type) is also handled by video.validator.js

    const reelFile = req.files.reelFile;
    const userId = req.user.id; // From auth middleware

    // 1) Fetch the user to get the username for the response
    const user = await User.findByPk(userId, { attributes: ['id', 'username'] });
    if (!user) {
      // This case should ideally not happen if the token is valid and user exists
      return res.status(401).json({ error: 'Authenticated user not found.' });
    }

    // 2) Crea el vídeo en BD
    const video = await Video.create({ title, description, creatorId: userId });

    // 3) Directorio base: /volumes/users/{userId}/{videoId}
    const videoDir = path.join(__dirname, '../../volumes/users', `${userId}`, `${video.id}`);
    await fs.promises.mkdir(videoDir, { recursive: true });

    // 4) Guardar original
    // Use a consistent extension or derive from uploaded file, ensure encoding.js can handle it.
    // For simplicity, let's assume we save with original extension or a default one like .mp4
    const originalExtension = path.extname(reelFile.name).toLowerCase() || '.mp4';
    const originalPath = path.join(videoDir, `video${originalExtension}`);
    
    try {
      await reelFile.mv(originalPath);
    } catch (mvErr) {
      console.error('Error moving uploaded file:', mvErr);
      // Attempt to cleanup video record if file move fails
      await Video.destroy({ where: { id: video.id } });
      return res.status(500).json({ error: 'Failed to save uploaded video file.' });
    }

    // 5) Generar thumbnail
    const thumbnailPath = path.join(videoDir, 'thumbnail.jpg');
    try {
      await new Promise((resolve, reject) => {
        const ffmpeg = require('fluent-ffmpeg'); // Ensure fluent-ffmpeg is available
        ffmpeg(originalPath)
          .on('end', resolve)
          .on('error', (err) => reject(new Error('Thumbnail generation failed: ' + err.message)))
          .screenshots({
            timestamps: ['1%'], // Take screenshot at 1% of video duration
            filename: 'thumbnail.jpg',
            folder: videoDir,
            size: '320x240'
          });
      });
    } catch (thumbErr) {
      console.error('Error generating thumbnail:', thumbErr);
      // Log error but proceed, a missing thumbnail might be acceptable for some use cases
      // Or, decide to rollback/delete video if thumbnail is critical
    }

    // 6) MPEG-DASH en subcarpeta dash/
    const dashFolder = path.join(videoDir, 'dash');
    await fs.promises.mkdir(dashFolder, { recursive: true });
    
    try {
      await encoding.normalize(originalPath, dashFolder);
    } catch (dashErr) {
      console.error('Error generating MPEG-DASH:', dashErr);
      // Log error, decide if this is critical. For now, we'll still return info for the video.
      // If DASH is critical, consider cleaning up and returning an error.
    }

    // 7) Responde con los campos públicos
    // Re-fetch the video instance to pass to makePublicVideo, or construct the necessary parts.
    // Since creator info is now fetched as 'user', we can pass that.
    const publicVideoData = await makePublicVideo({
      ...video.get(), // Spread the video instance properties
      creator: user    // Attach the fetched user object
    });
    
    res.status(201).json({
      message: 'Video uploaded and processing initiated.', // Processing might still be ongoing for DASH
      video: publicVideoData
    });

  } catch (err) {
    console.error("Error in createWithFile video controller:", err);
    // Check if it's a known Sequelize error or a generic one
    if (err.name && err.name.includes('Sequelize')) {
      return res.status(400).json({ error: "Database error during video creation.", details: err.message });
    }
    next(err); // Pass to global error handler
  }
};
