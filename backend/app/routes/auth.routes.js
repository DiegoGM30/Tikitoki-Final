const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth.controller");
const validator = require('../middlewares/validators/user.validator');

router.post('/signup', validator.validateUser, controller.signup);
router.post('/login', validator.validateLogin, controller.login);

module.exports = router;