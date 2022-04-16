const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('../utils/redis');

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      issuer: 'Nawaz',
      audience: userId,
    };

    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        return reject(createError.InternalServerError());
      }

      client.SET(userId, token);
      resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) {
    return next(createError.Unauthorized());
  }
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader.split(' ');
  const accessToken = bearerToken[1];
  JWT.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, payload) => {
      if (err) {
        return next(createError.Unauthorized());
      }
      const userId = payload.aud;
      const result = await client.GET(userId);
      if (accessToken === result) {
        req.payload = payload;
        next();
      } else {
        next(createError.Unauthorized());
      }
    }
  );
};

const passAccessToken = ({ result, user }) => {
  const secret = process.env.ACCESS_TOKEN_SECRET + user.password;
  const payload = {
    email: result.email,
    id: result.id,
  };
  const token = JWT.sign(payload, secret, { expiresIn: '5m' });

  return token;
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  passAccessToken,
};
