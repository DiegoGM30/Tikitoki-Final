const repo = '/thumbnails/';

module.exports = {
    UPLOADS: '/uploads/',           // Location of uploaded covers
    PUBLIC: repo,                   // Public location of thumbnails
    DEFAULT: repo + 'default.png',  // Default cover
    NAME_PREFIX: 'thumbnail-',      // Prefix of the public thumbnail file name
    EXTENSION: '.png'               // Transcoding format
};