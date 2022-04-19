const express = require('express');

const {
  userRegister,
  userLogin,
  userLogout,
  changePassword,
  resetPassword,
  updatePassword,
} = require('../controllers/userController');

const { verifyAccessToken, verifyPassToken } = require('../helpers/jwtHelper');

const router = express.Router();

const limter = require('express-rate-limit');

const loginLimiter = limter({
  windowMs: 1 * 60 * 1000,
  max: 10,
});

router.post('/register', userRegister);

router.post('/login', loginLimiter, userLogin);

router.post('/logout', verifyAccessToken, userLogout);

router.post('/change-password', verifyAccessToken, changePassword);

router.post('/reset-password', resetPassword);

router.post('/update-password', updatePassword);

module.exports = router;
