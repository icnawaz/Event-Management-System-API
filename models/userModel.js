const { getDb } = require('../utils/database');

const bcrypt = require('bcrypt');

class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  }

  async registerUser() {
    const db = getDb();
    await this.hashPassword();
    return db.collection('users').insertOne({
      name: this.name,
      email: this.email,
      password: this.password,
    });
  }

  async doesUserExist(email) {
    const db = getDb();
    const result = await db.collection('users').findOne({
      email: email,
    });
    return result;
  }

  async isValidPassword(email, password) {
    const db = getDb();
    const result = await db.collection('users').findOne({
      email: email,
    });
    const dbPassword = result.password;
    return await bcrypt.compare(password, dbPassword);
  }
}

module.exports = User;
