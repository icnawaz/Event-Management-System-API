const {
  registerSchema,
  loginSchema,
  resetPassSchema,
} = require('../helpers/validation-schema');
const createError = require('http-errors');
const { signAccessToken, passAccessToken } = require('../helpers/jwtHelper');
const User = require('../models/userModel');
const Password = require('../models/passModel');
const client = require('../utils/redis');
const { ObjectId } = require('mongodb');
const JWT = require('jsonwebtoken');

// User Registration
const userRegister = async (req, res, next) => {
  try {
    const result = await registerSchema.validateAsync(req.body);
    const doesExist = await new User().doesUserExist(result.email);
    if (doesExist) {
      throw createError.Conflict(`${result.email} is already registered!`);
    }
    const user = new User(result.name, result.email, result.password);
    await user.registerUser();

    res.status(201);
    res.send({
      response: {
        status: 201,
        message: 'Created',
      },
    });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    next(error);
  }
};

// User Login
const userLogin = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await new User().doesUserExist(result.email);
    if (!user) {
      throw createError.NotFound('User not registered');
    }
    const isMatch = await new User().isValidPassword(
      result.email,
      result.password
    );
    if (!isMatch) {
      throw createError.Unauthorized('Email/Password not valid');
    }
    const userId = user._id.toString();
    const accessToken = await signAccessToken(userId);

    res.send({
      response: {
        message: 'Success',
        accessToken: accessToken,
      },
    });
  } catch (error) {
    if (error.isJoi) {
      return next(createError.BadRequest('Invalid email / password'));
    }
    next(error);
  }
};

// User Logout
const userLogout = async (req, res, next) => {
  try {
    const userId = req.payload['aud'];
    client.DEL(userId);
    res.send({
      response: {
        status: 200,
        message: 'Success',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
const changePassword = (req, res, next) => {
  try {
    const userId = req.payload['aud'];
    const newPassword = req.body.password;
    new Password(userId, newPassword).changePassword();

    res.status(200);
    res.send({
      response: {
        status: 200,
        message: 'Success',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const result = await resetPassSchema.validateAsync(req.body);
    const user = await new User().doesUserExist(result.email);
    if (!user) {
      throw createError.NotFound('User not registered');
    }

    const token = passAccessToken({ result, user });

    res.status(200);
    res.send({
      response: {
        message: 'Update Password now',
        token: token,
      },
    });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    next(error);
  }
};

// Update Password

const updatePassword = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await new User().doesUserExist(result.email);
    if (!user) {
      throw createError.NotFound('User not registered');
    }
    const password = req.body.password;
    const userId = user._id;

    let { token } = req.query;
    const secret = process.env.ACCESS_TOKEN_SECRET + user.password;

    JWT.verify(token, secret, (err) => {
      if (err) {
        return next(createError.Unauthorized());
      }
    });

    await new Password(userId.toString(), password).changePassword();

    res.send({
      status: 200,
      message: 'Password Updated',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  changePassword,
  resetPassword,
  updatePassword,
};
