const {body, validationResult, param} = require('express-validator');
const { expressjwt: jwt } = require('express-jwt');
const auth = require('../../config/auth.config');
const path = require('path');

exports.create = [
  jwt({ secret: auth.secret, algorithms: [ auth.algorithm ] }),
  body('title')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Video title can not be empty!')
    .bail(),
  body('creator')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Invalid creator!')
    .bail()
    .isLength({min: 3})
    .withMessage('Minimum 3 characters required!')
    .bail(),
  body('description')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Invalid description!')
    .bail()
    .isLength({min:5})
    .withMessage('Minimum 5-characters description')
    .bail(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
    next();
  },
];

module.exports.upload = [
  jwt({ secret: auth.secret, algorithms: [ auth.algorithm ] }),
  param('id', 'missing video id')
    .exists()
    .isNumeric()
    .bail(),
  body('reelFile', 'Please upload your short video!')
    .custom((value, { req }) => {
      const extension = (path.extname(req.files.reelFile.name)).toLowerCase();
      switch (extension) {
        case '.mp4':
          return '.mp4';
        case '.avi':
          return '.avi';
        case  '.mov':
          return '.mov';
        case  '.webm':
          return '.webm';
        case  '.mkv':
          return '.mkv';
        case  '.ogv':
          return '.ogv';
        default:
          return false;
      }
    })
    .bail(),
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
      next();
  },
];

module.exports.uploadthumbnail = [
  jwt({ secret: auth.secret, algorithms: [ auth.algorithm ] }),
  param('id', 'missing video id')
    .exists()
    .isNumeric()
    .bail(),
    
  body('thumbnailFile', 'Please upload thumbnail image file!')
    .custom((value, { req }) => {
      const extension = (path.extname(req.files.thumbnailFile.name)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case  '.png':
          return '.png';
        default:
          return false;
      }
    })
    /*.bail(), 
  body('reelFile', 'Please upload the video!')
    .custom((value, { req }) => {
      const extension = (path.extname(req.files.reelFile.name)).toLowerCase();
      switch (extension) {
        case '.mp4':
          return '.mp4';
        case '.avi':
          return '.avi';
        case  '.mov':
          return '.mov';
        case  '.webm':
          return '.webm';
        case  '.mkv':
          return '.mkv';
        case  '.ogv':
          return '.ogv';
        default:
          return false;
      }
    })
    */
    .bail(),
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
      next();
  },
];