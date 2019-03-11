const express = require('express');
const router = express.Router();

const auth = require('../middleware/student-auth');
const Tutor = require('./../model/tutor');
const Student = require('./../model/student');
const Class = require('./../model/class');
const Review = require('./../model/review');
const Booking = require('./../model/booking');

const { postValidation } = require('./../core/validators/student-validator');
const { postReview } = require('./../core/validators/review-validator');
const { hashPassword } = require('./../core/password-hasher');


/*
	TODO:
	1. Store Image
*/

router.post('/signup', (req, res) => {
    try {
        // Checks whether the body of the request is correct;
        var { error } = postValidation(req.body);
        if (error) throw new Error(error.details[0].message);

        hashPassword(req.body.password)
         .then(hashedPassword => {
             // Creating a new instance of the model student and the
             // hashed password
            const student = new Student({
                firstName: req.body.firstName,
                lastName:  req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                institution: req.body.institution,
                semester:  req.body.semester,
                img: req.body.img
            });

            // Saving function, async function
            student.save()
             .then(student => {
                console.log(student);
                const token = student.generateToken();
                res.header('x-auth-token', token).send(student);
            })
             .catch(error => res.status(404).send(error.message));

         });
    } catch(error) {
        res.status(404).send(error.message);
    }
});

// auth is the middleware function that verifies that the user is logged in
router.get('/dashboard', auth, (req, res) => {
    res.send('Welcome ' + req.student.name +' ! id: '+ req.student._id);

});

router.get('/classes', (req, res) => {
    Class.find({ availability: true })
     .then(classes => {
        console.log(classes)
        res.json(classes)
     })
     .catch(error => res.status(404).send(error.message));
});

router.post('/new-review/:id', auth, (req, res) =>{
    //Check first the input of the user
    var { error } = postReview(req.body);
    if (error) throw new Error(error.details[0].message);

    Class.findOne({ _id: req.params.id }).then( tutorClass => {
      const review = new Review({
            student: req.student._id,
            tutor: tutorClass.tutor,
            class: tutorClass._id,
            comment: req.body.comment,
            stars: req.body.stars,
            date: req.body.date
      });

      review.save()
        .then(review => {
            console.log(review);
            res.json(review);
        })
        .catch(error => res.status(404).send(error.message));

      Tutor.findOne({ _id: tutorClass.tutor })
       .then(async tutor => {
           tutor.stars += review.stars;
           tutor.save()
            .catch(error => res.status(404).send(error.message));

           tutorClass.tutor_rating = await tutor.getAverageRating();
           tutorClass.save()
            .catch(error => res.status(404).send(error.message));
       })
    })
    .catch(error => res.status(404).send(error.message));
});

//          B   O   O   K   I   N   G
router.post('/book/:id',auth, (req, res) => {
    Class.findById(req.params.id)
     .then(queried_class => {
         if(!queried_class) throw new Error('Class was not found.');
         
         const student_id = req.student._id;
         const tutor_id = queried_class.tutor
         const booking = new Booking({
             tutor: tutor_id,
             student: student_id,
             booked_class: queried_class._id
         });
         
         booking.save()
          .then(booking => {
              res.send(booking);
          })
          .catch(error => res.status(404).send(error.message));
          
     })
     .catch(error => res.status(404).send(error.message))
});

router.put('/booking/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Cancelled'
    }, { new: true })
     .then(cancelledBooking => {
        console.log(cancelledBooking);
        res.json(cancelledBooking);
   })
    .catch(error => res.status(404).send(error.message));
})
module.exports = router;
