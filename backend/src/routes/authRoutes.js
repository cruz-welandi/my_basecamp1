const express = require('express');
const auth = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.put("/updateUser/:userId", auth, authController.updateUser);

module.exports = router;