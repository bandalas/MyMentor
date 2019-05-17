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
                    const url_token = 'https://enigmatic-dawn-55919.herokuapp.com/reset_password/reset?token=' + token;
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
                user.password = hashed;
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

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Fetching all new available 
*       classes that have not been booked by the student, sorted by newest
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.get('/new-classes', auth, (req, res) => {
    Booking.find({
        student: req.student._id
    },{booked_class: 1, _id: 0})
     .then(bookings => {
        const ids = bookings.map(b => b.booked_class);
        Class.find({
            availability: true,
            _id:{ $nin: ids}
        })
         .hint({$natural:-1})
         .then(classes => {
            res.json(classes)
         })
         .catch(error => res.status(400).send(error.message))
         })
     .catch(error => res.status(400).send(error.message));
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*              Registers a new review
*       
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.post('/new-review/:id', auth, (req, res) =>{
    //Check first the input of the user
    Class.findOne({ _id: req.params.id }).then( tutorClass => {
        console.log(tutorClass);
        const review = new Review({
            student: req.student._id,
            tutor: tutorClass.tutor,
            class: tutorClass._id,
            comment: req.body.comment,
            stars: req.body.stars,
      });

      review.save()
        .then(review => {
            console.log(review);
            res.json(review);
        })
        .catch(error => {
            console.log(error);
            res.status(400).send(error.message)
        });

      Tutor.findOne({ _id: tutorClass.tutor })
       .then(async tutor => {
           tutor.stars += review.stars;
           tutor.save()
            .catch(error => {
                console.log(error);
                res.status(400).send(error.message)
            });

           tutorClass.tutor_rating = await tutor.getAverageRating();
           tutorClass.save()
            .catch(error => {
                console.log(error);
                res.status(400).send(error.message)
            });
       })
    })
    .catch(error => {
        console.log(error);
        res.status(400).send(error.message)
    });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*               Fetches all upcoming classes
*       
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.get('/upcoming', auth, (req, res) => {
    Booking.find({
        student: req.student._id,
        status: 'Accepted'
    }, {booked_class: 1, _id: 1})
     .then(bookings => {
        const ids_class = bookings.map(b => b.booked_class);
        const ids_booking_class = bookings.map(b => ({ booking: b._id, class: b.booked_class}))
        Class.find({
            _id: {$in: ids_class},
            date: {$gte: new Date()}
        })
         .hint({$natural:-1})
         .then(classes => {
             let data = []
             let count = 0;
             classes.forEach( c => {
                 let booking = ids_booking_class.find(elem => {return JSON.stringify(elem.class) === JSON.stringify(c._id)});
                 result = {
                     _id: booking.booking,
                     name: c.name,
                     subject: c.subject,
                     date: c.date
                 }
                 data.push(result);
                 count++;
                 if(count === classes.length) res.json(data);
             })
             if(classes.length == 0) res.json(data);
         })
         .catch(error => res.status(400).send(error.message))
         })
     .catch(error => res.status(400).send(error.message));
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*               Fetches past classes
*       
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.get('/past', auth, (req, res) => {
    Review.find({}, {class:1, _id:0})
     .then(reviews => {
         var review_ids = reviews.map(review => JSON.stringify(review.class));
         Booking.find({
            student: req.student._id,
            status: 'Accepted'
        }, {booked_class: 1})
            .then(bookings => {
            const ids_class = bookings.map(b => b.booked_class);
            const ids_booking_class = bookings.map(b => ({ booking: b._id, class: b.booked_class}))
            Class.find({
                _id: {$in: ids_class},
                date: {$lt: new Date()}
            })
                .hint({$natural:-1})
                .then(classes => {
                    let data = []
                    let count = 0;
                    classes.forEach( c => {
                        let booking = ids_booking_class.find(elem => {return JSON.stringify(elem.class) === JSON.stringify(c._id)});
                        const hasReview = review_ids.includes(JSON.stringify(c._id));
                        result = {
                            _id: booking.booking,
                            name: c.name,
                            subject: c.subject,
                            date: c.date,
                            class: c._id,
                            hasReview: hasReview
                        }
                        data.push(result);
                        count++;
                        if(count === classes.length) res.json(data);
                    })
                    if(classes.length == 0) res.json(data);
                })
                .catch(error => res.status(400).send(error.message))
                })
            .catch(error => res.status(400).send(error.message));
        })
     .catch(error => res.status(400).send(error.message));
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*               Bookings
*       
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
//Student creates a new class booking
router.post('/book/:id',auth, (req, res) => {
    Class.findById(req.params.id)
     .then(queried_class => {
         console.log(queried_class)
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
     .catch(error => { 
         res.status(400).send(error.message)
         //console.log(error);
    })
});

//Cancels a student class booking
router.put('/booking/:id', auth, (req, res) => {
    console.log()
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