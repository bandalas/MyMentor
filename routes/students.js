const express = require('express');
const router = express.Router();

const auth = require('../middleware/student-auth');
const Tutor = require('./../model/tutor');
const Student = require('./../model/student');
const Class = require('./../model/class');
const Review = require('./../model/review');
const Booking = require('./../model/booking');

const crypto = require('crypto');
const email = 'mymentormx@gmail.com';
const password = 'mymentorbrandon#';
const nodemailer = require('nodemailer');

const { postReview } = require('./../core/validators/review-validator');
const { hashPassword } = require('./../core/password-hasher');

/*
	TODO:
	1. Store Image
*/
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Creates a Student and stores it in the database
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.post('/signup', (req, res) => {
    try {
        console.log(req.body);
        hashPassword(req.body.password)
         .then(hashedPassword => {
             // Creating a new instance of the model student and the hashed password
            const student = new Student({
                firstName: req.body.firstName,
                lastName:  req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                institution: req.body.institution,
                semester:  req.body.semester,
            });
            // Saving function, async function
            student.save()
             .then(student => {
                const token = student.generateToken();
                res.header('x-auth-token', token).send({
                    success : 'true'
                });
            })
             .catch(error => res.send({
                 success: false,
                 error: error.message
             }));
         });
    } catch(error) {
        res.status(400).send(error.message);
    }
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Checks if an email is in use
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
//  No need for middleware
router.post('/email', (req, res) => {
    Student.find({
        email: req.body.tutor_email
    })
     .then(record => {
         // We want to know whether the record was found or not
         if(record.length > 0) return res.send({found: true});
         res.send({found: false});
     })
     .catch(error => {
         console.log(error.message);
     });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Email sender for forgotten password
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
    auth: {
      user: email,
      pass: password
    }
  });
  
router.post('/forgot-password', (req, res) => {
    Student.findOne({
        email: req.body.email
    })
     .then( user => {
        if( user ) {
            crypto.randomBytes(20, (err, buffer) => {
                var token = buffer.toString('hex');
                Student.findByIdAndUpdate({_id: user._id }, 
                    { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, 
                    { upsert: true, new: true }
                ).then(new_user => {
                    const url_token = 'http://localhost:3000/reset_password/reset?token=' + token;
                    var data = {
                        to: new_user.email,
                        from: email,
                        template: 'forgot-password-email',
                        subject: 'Password help has arrived!',
                        text: "Hello "+new_user.firstName+", reset link: " +url_token,
                    };
                    smtpTransport.sendMail(data, err => {
                        if (!err) {
                          return res.json({ success: true });
                        }
                        else {
                            return res.json({ success: false});
                        }
                    });
                })
            })   
        }
     })
     .catch( error => {
         return res.json({ success: false});
     })
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Password reset
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.post('/reset_password', (req, res) => {
    const token = req.body.token;
    Student.findOne({
        reset_password_token: token,
        reset_password_expires: {
          $gt: Date.now()
        }
    })
     .then(user => {
         if(user) {
             hashPassword(req.body.password)
              .then( hashed => {
                user.hash_password = hashed;
                user.reset_password_token = undefined;
                user.reset_password_expires = undefined;
                user.save()
                 .then( saved => {
                     res.send({success: true});
                 })
              })
        }
        else {
            res.send({success: false});
        }
     })
     .catch(error => {
        res.send({success: false});
     })
});

/*
*   Fetching mentors sorted by their star ranking
*/
router.get('/mentors', auth, (req, res) => {
Tutor.find().sort({stars: 1})
     .then(mentors => {
        res.json(mentors)
     })
     .catch(error => res.status(400).send(error.message));
});

/*
*   Fetching all available classes
*/
router.get('/classes',auth, (req, res) => {
    Class.find({ availability: true })
     .then(classes => {
        res.json(classes)
     })
     .catch(error => res.status(400).send(error.message));
});

/*
*   Fetching all new available classes, sorted by newest
*/
router.get('/new-classes', auth, (req, res) => {
    Class.find({availability: true})
     .hint({$natural:-1})
     .then(classes => {
         res.json(classes)
     })
     .catch(error => res.status(400).send(error.message));
});

/*
*   Registering a new review
*/
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
        .catch(error => res.status(400).send(error.message));

      Tutor.findOne({ _id: tutorClass.tutor })
       .then(async tutor => {
           tutor.stars += review.stars;
           tutor.save()
            .catch(error => res.status(400).send(error.message));

           tutorClass.tutor_rating = await tutor.getAverageRating();
           tutorClass.save()
            .catch(error => res.status(400).send(error.message));
       })
    })
    .catch(error => res.status(400).send(error.message));
});

//          B   O   O   K   I   N   G


/*
*   Student creates a new class booking
*/
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
          .catch(error => res.status(400).send(error.message));
          
     })
     .catch(error => res.status(400).send(error.message))
});

/*
*   Cancels a student class booking
*/
router.put('/booking/:id', auth, (req, res) => {
    Booking.findByIdAndUpdate(req.params.id, {
        status: 'Cancelled'
    }, { new: true })
     .then(cancelledBooking => {
        console.log(cancelledBooking);
        res.json(cancelledBooking);
   })
    .catch(error => res.status(400).send(error.message));
})

module.exports = router;