const express = require('express');
const {
  createEvent,
  inviteUsers,
  getEventDetails,
  eventUpdate,
  showMyEvents,
} = require('../controllers/eventController');

const { verifyAccessToken } = require('../helpers/jwtHelper');

const router = express.Router();

router.post('/create-event', verifyAccessToken, createEvent);

router.post('/invite-users', verifyAccessToken, inviteUsers);

router.get('/get-event-details', verifyAccessToken, getEventDetails);

router.post('/event-update', verifyAccessToken, eventUpdate);

router.post('/show-my-events', verifyAccessToken, showMyEvents);

module.exports = router;
