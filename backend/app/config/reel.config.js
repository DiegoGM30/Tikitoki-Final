const repo = '/reels/';

module.exports = {
    UPLOADS: '/uploads/',           // Location of uploaded covers
    PUBLIC: repo,                   // Public location of covers
    DEFAULT: repo + 'default.mp4',  // Default cover
    NAME_PREFIX: 'reel-',            // Prefix of the public cover file name
    EXTENSION: '.mp4'               // Transcoding format
};