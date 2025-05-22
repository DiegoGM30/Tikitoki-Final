const { body, validationResult } = require('express-validator');

exports.validateUser = [
  body('username')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Username cannot be empty!')
    .isLength({ min: 4 })
    .withMessage('Minimum 4 characters required!'),
  body('password')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Password cannot be empty!')
    .isLength({ min: 8 })
    .withMessage('Minimum 8 characters required!')
    .matches(/[a-z]/)
    .withMessage('Must contain at least one lowercase letter!')
    .matches(/[A-Z]/)
    .withMessage('Must contain at least one uppercase letter!')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Must contain at least one symbol!'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];

exports.validateLogin = [
  body('username')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Username cannot be empty!'),
  body('password')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Password cannot be empty!'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    next();
  },
];
