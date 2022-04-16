const crypto = require('crypto');

// generate secret key
const key = crypto.randomBytes(32).toString('hex');
