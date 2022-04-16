const { getDb } = require('../utils/database');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

class Password {
  constructor(userId, newPassword) {
    this.userId = userId;
    this.newPassword = newPassword;
  }

  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.newPassword, salt);
    this.newPassword = hashedPassword;
  }

  async changePassword() {
    const db = getDb();
    await this.hashPassword();
    db.collection('users').updateOne(
      { _id: new ObjectId(this.userId) },
      { $set: { password: `${this.newPassword}` } }
    );
  }
}

module.exports = Password;
