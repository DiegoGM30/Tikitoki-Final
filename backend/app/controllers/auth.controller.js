// File: backend/app/controllers/auth.controller.js

const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Destructure User model
const config = require('../config/auth.config');
const fs = require('fs');
const path = require('path');


module.exports.signup = async (req, res, next) => {
    try {
      // Validation for username and password is handled by user.validator.js

      // 1) Creamos el usuario
      const user = await User.create({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, config.salt)
      });
  
      // 2) Creamos su carpeta en disco
      const userDir = path.join(__dirname, '../../volumes/users', `${user.id}`);
      try {
        await fs.promises.mkdir(userDir, { recursive: true });
      } catch (dirError) {
        // If directory creation fails, it's a server-side issue.
        // Log it, and potentially decide if the user record should be removed.
        // For now, we'll log and proceed, but this indicates a setup problem.
        console.error(`🔴 Failed to create directory for user ${user.id}:`, dirError);
        // Depending on policy, you might want to:
        // await User.destroy({ where: { id: user.id } });
        // return res.status(500).json({ message: "User registration partially failed due to a server error." });
      }
  
      // 3) Respondemos OK
      return res.status(201).json({ message: "User was registered successfully!" });

    } catch (error) {
      // Si el username ya existe, devolvemos 409 Conflict
      if (error instanceof Sequelize.UniqueConstraintError) {
        const messages = error.errors.map(e => e.message);
        return res.status(409).json({ error: "Username already exists.", details: messages });
      }
      
      // Handle other Sequelize validation errors (e.g., if model has more constraints)
      if (error instanceof Sequelize.ValidationError) {
        const messages = error.errors.map(e => e.message);
        return res.status(400).json({ error: "Validation error during user registration.", details: messages });
      }
  
      // Para cualquier otro error, lo logueamos y lo pasamos al handler
      console.error("🔴 Signup unexpected error:", error);
      // Avoid sending detailed internal errors to client in production
      return res.status(500).json({ error: "An unexpected error occurred during registration." });
      // Or use next(error) if you have a centralized error handler that sanitizes messages.
      // next(error); 
    }
  };
  

module.exports.login = async (req, res, next) => {
    try {
        // Validation for username and password is handled by user.validator.js
        const user = await User.findOne({ where: { username: req.body.username } });
        
        if (!user) {
            // Use a generic message to avoid confirming if a username exists
            return res.status(401).json({ error: "Invalid username or password." });
        }
        
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.expiresIn || 86400, // 24 hours default, or from config
            algorithm: config.algorithm || 'HS256' // Default or from config
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            token: token
        });
    }
    catch (error) {
        console.error("🔴 Login error:", error);
        // Avoid sending detailed internal errors to client in production
        return res.status(500).json({ error: "An unexpected error occurred during login." });
        // Or use next(error)
        // next(error);
    }
};
