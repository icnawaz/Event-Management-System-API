const { getDb } = require('../utils/database');
const { ObjectId } = require('mongodb');

class Event {
  constructor(eventDetails) {
    this.eventDetails = eventDetails;
  }

  async createEvent() {
    const db = getDb();
    const result = await db.collection('events').insertOne(this.eventDetails);
    return result;
  }

  async eventOwner(userId) {
    const db = getDb();

    const result = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    return result;
  }

  static addEvent({ userId, creatorEventDetails }) {
    const db = getDb();
    db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $push: { createdEvent: creatorEventDetails } }
    );

    return;
  }

  async getEventById(eventId) {
    const db = getDb();
    const result = await db
      .collection('events')
      .findOne({ _id: new ObjectId(eventId) });

    return result;
  }

  async showEventByUser(userId) {
    const db = getDb();
    const result = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    return result;
  }

  async getEvent({ search, limit, skip, type, date }) {
    const db = getDb();
    const result = await db
      .collection('events')
      .find({}, { limit: limit, skip: skip })
      .sort({ eventDate: type });

    if (search) {
      result.filter({ eventName: search.toUpperCase() });
    }

    if (date) {
      result.filter({ eventDate: date });
    }

    return result.toArray();
  }

  async updateEvent({ eventId, eventName, eventDate, eventPurpose }) {
    const db = getDb();
    const demo = await this.getEventById(eventId);

    db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      {
        $set: {
          eventName: eventName.toUpperCase() || demo.eventName,
          eventDate: eventDate || demo.eventDate,
          eventPurpose: eventPurpose || demo.eventPurpose,
        },
      }
    );

    return;
  }
}

class Invite extends Event {
  constructor(eventId, eventName, userEmail) {
    super();
    this.eventId = eventId;
    this.eventName = eventName;
    this.userEmail = userEmail;
  }

  async inviteUsers() {
    const db = getDb();

    db.collection('events').updateOne(
      { _id: new ObjectId(this.eventId) },
      { $push: { invitedUsers: this.userEmail } }
    );

    return;
  }

  async getEventDetails({ eventId, eventName, eventCretorId }) {
    const db = getDb();
    const eventOwner = await this.eventOwner(eventCretorId);

    const result = await db
      .collection('events')
      .find({
        $and: [
          { eventName: eventName.toUpperCase() },
          { eventOwner: eventOwner.name },
          { _id: new ObjectId(eventId) },
        ],
      })
      .toArray();

    return result;
  }

  async addEvent({ eventId, userEmail, eventName, eventCretorId }) {
    const db = getDb();
    const getEventDetails = await this.getEventDetails({
      eventId,
      eventName,
      eventCretorId,
    });

    const eventDetails = {
      eventId: eventId,
      eventName: getEventDetails[0].eventName,
      eventOwner: getEventDetails[0].eventOwner,
    };

    db.collection('users').updateOne(
      { email: userEmail },
      { $push: { invitedEvent: eventDetails } }
    );

    return;
  }
}

module.exports = {
  Event,
  Invite,
};
