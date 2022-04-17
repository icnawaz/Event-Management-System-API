const createError = require('http-errors');
const { Event, Invite } = require('../models/eventModel');
const moment = require('moment');

// Create a Event
const createEvent = async (req, res, next) => {
  try {
    const eventName = req.body.eventName;
    const eventDate = req.body.eventDate;
    const isDateValid = moment(eventDate, 'DD/MM/YYYY', true).isValid();
    if (!isDateValid) {
      throw next(createError.BadRequest('Invalid Date'));
    }
    const eventPurpose = req.body.eventPurpose;
    const userId = req.payload['aud'];

    const eventDetails = {
      eventName: eventName.toUpperCase(),
      eventDate: eventDate,
      eventPurpose: eventPurpose,
    };

    const creatorEventDetails = { ...eventDetails };

    const user = await new Event().eventOwner(userId);
    eventDetails['eventOwner'] = user.name;
    eventDetails['mail'] = user.email;
    const eventInfo = await new Event(eventDetails).createEvent();
    const eventId = eventInfo.insertedId.toString();

    creatorEventDetails['eventId'] = eventId;
    Event.addEvent({ userId, creatorEventDetails });

    res.status(201);
    res.send({
      response: {
        status: 201,
        message: 'Success',
      },
    });
  } catch (error) {
    next(createError.BadRequest('Invalid Details'));
  }
};

// Invite users for Event
const inviteUsers = async (req, res, next) => {
  try {
    const eventId = req.body.eventId;
    const eventName = req.body.eventName;
    const userEmail = req.body.userEmail;
    const eventCretorId = req.payload['aud'];

    await new Invite(eventId, eventName.toUpperCase(), userEmail).inviteUsers();
    await new Invite().addEvent({
      eventId,
      userEmail,
      eventName,
      eventCretorId,
    });

    res.send({
      status: 200,
      message: 'Success',
    });
  } catch (error) {
    next(createError.BadRequest('Invalid Details'));
  }
};

// Get event details
const getEventDetails = async (req, res, next) => {
  try {
    let { page, count, sort, search, date } = req.query;

    if (!page) {
      page = 1;
    }
    if (!count) {
      count = 2;
    }
    if (sort === 'asc' || !sort) {
      type = 1;
    }
    if (sort === 'des') {
      type = -1;
    }
    const limit = parseInt(count);
    const skip = (page - 1) * count;

    const events = await new Event().getEvent({
      search,
      type,
      limit,
      skip,
      date,
    });

    if (!events[0]) {
      throw next(createError.BadRequest('Invalid Event Name'));
    } else {
      res.send({
        page,
        count,
        events,
      });
    }
  } catch (error) {
    next(createError.BadRequest('Invalid Event Name'));
  }
};

// Update event details
const eventUpdate = async (req, res, next) => {
  try {
    const eventId = req.body.eventId;
    const eventName = req.body.eventName;
    const eventDate = req.body.eventDate;

    if (eventDate) {
      const isDateValid = moment(eventDate, 'DD/MM/YYYY', true).isValid();
      if (!isDateValid) {
        throw next(createError.BadRequest('Invalid Date'));
      }
    }
    const eventPurpose = req.body.eventPurpose;

    await new Event().updateEvent({
      eventId,
      eventName,
      eventDate,
      eventPurpose,
    });

    res.send({
      message: 'Event Updated',
    });
  } catch (error) {
    next(createError.BadRequest('Invalid'));
  }
};

// Show my events
const showMyEvents = async (req, res, next) => {
  try {
    const userId = req.payload['aud'];
    const result = await new Event().showEventByUser(userId);
    res.send({
      createdEvent: result.createdEvent,
      invitedEvent: result.invitedEvent,
    });
  } catch (error) {
    next(createError.BadRequest(error));
  }
};

module.exports = {
  createEvent,
  inviteUsers,
  getEventDetails,
  eventUpdate,
  showMyEvents,
};
