const express = require('express');
const router = express.Router();
var ObjectId = require('mongodb').ObjectID;

const auth = require('../middleware/tutor-auth');
const Booking = require('./../model/booking');
const Notification = require('./../model/notification');
const Class = require('../model/class');
const Student = require('../model/student');

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

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Fetches all bookings
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
//      Pending bookings
router.get('/',auth, (req, res) => {
    const tutor_id = req.tutor._id
    Booking.find({
        tutor : tutor_id,
        status: 'Pending'
    })
     .sort({ date:1 })
     .then((bookings) => {
        let data = []
        let count = 0;
        bookings.forEach(b => {
            var c_id = b.booked_class;
            var s_id = b.student;

            Class.findOne({ _id : ObjectId(c_id)})
                .then( c => {
                    var c_name = c.name;
                    var c_date = c.date;

                    Student.findOne({ _id : ObjectId(s_id)})
                    .then(s => {
                        if(s) {
                            var s_name = s.firstName + " " + s.lastName;
                            let response = {
                                student: s_name,
                                class: c_name,
                                date: c_date,
                                _id: b._id,
                                status: b.status
                            }
                            data.push(response);
                            count++;
                            if(count == bookings.length) {
                                res.json(data)
                            }
                        }
                    })
                })
        });
      })
     .catch(error => res.status(400).send(error.message));
});
//      Accepted bookings
router.get('/accepted', auth, (req, res) => {
    const tutor_id = req.tutor._id
    Booking.find({
        tutor : tutor_id,
        status: 'Accepted'
    })
     .sort({ date:1 })
     .then((bookings) => {
        let data = []
        let count = 0;
        bookings.forEach(b => {
            var c_id = b.booked_class;
            var s_id = b.student;

            Class.findOne({ _id : ObjectId(c_id)})
                .then( c => {
                    var c_name = c.name;
                    var c_date = c.date;

                    Student.findOne({ _id : ObjectId(s_id)})
                    .then(s => {
                        if(s) {
                            var s_name = s.firstName + " " + s.lastName;
                            let response = {
                                student: s_name,
                                class: c_name,
                                date: c_date,
                                _id: b._id,
                                status: b.status
                            }
                            data.push(response);
                            count++;
                            if(count == bookings.length) {
                                res.json(data)
                            }
                        }
                    })
                })
        });
      })
     .catch(error => res.status(404).send(error.message));
});
//      Cancelled bookings
router.get('/cancelled', auth, (req, res) => {
    const tutor_id = req.tutor._id
    Booking.find({
        tutor : tutor_id,
        status: 'Cancelled'
    })
     .sort({ date:1 })
     .then((bookings) => {
        let data = []
        let count = 0;
        bookings.forEach(b => {
            var c_id = b.booked_class;
            var s_id = b.student;

            Class.findOne({ _id : ObjectId(c_id)})
                .then( c => {
                    var c_name = c.name;
                    var c_date = c.date;

                    Student.findOne({ _id : ObjectId(s_id)})
                    .then(s => {
                        if(s) {
                            var s_name = s.firstName + " " + s.lastName;
                            let response = {
                                student: s_name,
                                class: c_name,
                                date: c_date,
                                _id: b._id,
                                status: b.status
                            }
                            data.push(response);
                            count++;
                            if(count == bookings.length) {
                                res.json(data)
                            }
                        }
                    })
                })
        });
      })
     .catch(error => res.status(404).send(error.message));
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Functions that handle all booking actions
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
//      Accepts a booking
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
         .catch(error => res.status(400).send(error.message));

         notify_student(updated, 'Booking Accepted');
         res.send(updated);
     })
     .catch(error => res.status(400).send(error.message));
});
//      Rejects a booking
router.put('/reject/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Rejected'
    }, {new : true})
     .then(updated => {
         notify_student(updated, 'Booking Rejected');
         res.send(updated);
     })
     .catch(error => res.status(400).send(error.message));
});
//      Cancels a booking
router.put('/cancel/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Cancelled'
    }, {new : true})
     .then(updated => {
         notify_student(updated, 'Booking Cancelled');
         res.send(updated);
     })
     .catch(error => res.status(400).send(error.message));
});

module.exports = router;