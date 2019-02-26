const express = require('express');
const router = express.Router();

const auth = require('../middleware/tutor-auth');
const Booking = require('./../model/booking');

router.get('/',auth, (req, res) => {
    const tutor_id = req.tutor._id
    Booking.find({
        tutor : tutor_id,
        status: 'Pending'
    })
     .sort({date:1})
     .then((booking) => {
         if(!booking) res.send('No booking requests yet.');
         res.send(booking)
      })
     .catch(error => res.status(404).send(error.message));
});

router.put('/accept/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Accepted'
    }, {new : true})
     .then((updated) => {
         if(!updated) res.send('Wrong id.');
         
         var bulk = Booking.collection.initializeOrderedBulkOp();
         bulk.find({
             status: 'Pending',
             booked_class: updated.booked_class
            })
            .update({ $set:{
                status: 'Rejected'
            }})
         bulk.execute()
         .then(updated_bulk => {
             res.send(updated)
            })
         .catch(error => res.status(404).send(error.message));
     })
     .catch(error => res.status(404).send(error.message));
});

router.put('/reject/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Rejected'
    }, {new : true})
     .then((updated) => {
         res.send(updated)
     })
     .catch(error => res.status(404).send(error.message));
});

module.exports = router;