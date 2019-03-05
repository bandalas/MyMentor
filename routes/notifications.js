const express = require('express');
const router = express.Router();

const auth = require('../middleware/student-auth');
const Student = require('./../model/student');
const Notification = require('./../model/notification');

router.get('/', auth, (req, res) => {
    Notification.find({ student: req.student._id })
     .then(notifications => {
         if(!notifications) res.send('No notifications yet.');
         res.send(notifications);
      })
     .catch(error => res.status(404).send(error.message));
});


module.exports = router;
