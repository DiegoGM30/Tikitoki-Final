const videos = [];
const thumbnailConfig = require('../config/thumbnail.config');
const reelConfig = require('../config/reel.config');

// const videos = [{id: 1, title: "Me at the zoo", creator: "jawed", description: "First video in Youtube"}];

module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define("videos", {  // Table name and fields
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        creator: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        thumbnail: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: thumbnailConfig.DEFAULT
        },
        reel: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: reelConfig.DEFAULT
        }

    });

    return Video;
};

/*
module.exports.create = (data) => {
    const id = videos.length + 1;
    const video = { id: id, title: data.title, creator: data.creator, description: data.description }; 
    videos.push(video);
    return Promise.resolve(video);
};

module.exports.findAll = () => {
    return Promise.resolve(videos);    
};

module.exports.findById = (id) => {
    const video = videos.find(video => video.id == id);
    return Promise.resolve(video);
}

module.exports.drop = () => {
    videos.length = 0;
    return Promise.resolve();
}
*/