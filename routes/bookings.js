const express = require('express');
const router = express.Router();

const auth = require('../middleware/tutor-auth');
const Booking = require('./../model/booking');
const Notification = require('./../model/notification');

function notify_student(booking, booking_status) {
    const notification = new Notification({
        student: booking.student,
        class: booking.booked_class,
        type: booking_status
    });
    notification.save()
    .then(notification => {
        console.log(notification);
    })
    .catch(error => console.log('Couldnt notify student ' + error.message));
}

router.get('/',auth, (req, res) => {
    const tutor_id = req.tutor._id
    Booking.find({
        tutor : tutor_id,
        status: 'Pending'
    })
     .sort({ date:1 })
     .then((booking) => {
         if(!booking) res.send('No booking requests yet.');
         res.send(booking);
      })
     .catch(error => res.status(404).send(error.message));
});

router.put('/accept/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Accepted'
    }, { new : true })
     .then((updated) => {
         if(!updated) res.send('Wrong id.');

         // Rejects other pending bookings.
         Booking.find({
            status: 'Pending',
            booked_class: updated.booked_class
         })
         .then(pendings => {
            pendings.forEach(function(booking) {
                booking.status = 'Rejected';
                notify_student(booking, 'Booking Rejected');
                booking.save();
            });
         })
         .catch(error => res.status(404).send(error.message));

         notify_student(updated, 'Booking Accepted');
         res.send(updated);
     })
     .catch(error => res.status(404).send(error.message));
});

router.put('/reject/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Rejected'
    }, {new : true})
     .then(updated => {
         notify_student(updated, 'Booking Rejected');
         res.send(updated);
     })
     .catch(error => res.status(404).send(error.message));
});

module.exports = router;