module.exports = (sequelize, Sequelize) => {
    const Video = sequelize.define("videos", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        creatorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    });

    Video.associate = function(models) {
        Video.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
    };

    return Video;
};
