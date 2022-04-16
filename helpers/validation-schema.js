const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).uppercase().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
});

const resetPassSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

module.exports = { registerSchema, loginSchema, resetPassSchema };
