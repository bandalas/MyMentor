const express = require('express');
const router = express.Router();

const auth = require('../middleware/student-auth');
const Student = require('./../model/student');
const Class = require('./../model/class');
const { postValidation } = require('./../core/validators/student-validator');
const { postReview } = require('./../core/validators/review-validator');
const { hashPassword } = require('./../core/password-hasher');
const Review = require('./../model/review');

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

router.get('/classes', auth, (req, res) => {
    const classes = Class.find().exec(function(err, classes) {
        if(!classes.length) {
            console.log([]);
            res.json([]);
        }
        else {
            let arrClasses = classes.map(c => c.toObject());
            console.log(arrClasses);
            res.json(arrClasses);
        }
    });
});

router.post('/new-review/:id', auth, (req, res) =>{
    //Check first the input of the user
    var { error } = postReview(req.body);
    if (error) throw new Error(error.details[0].message);

    Class.findOne({ _id: req.params.id }).then( tutorClass => {
      const review = new Review({
            student: req.student._id,
            class: tutorClass._id,
            comment: req.body.comment,
            stars: req.body.stars,
            date: req.body.date
        })

      review.save()
        .then(review => {
            console.log(review);
            res.status(404).send(review)
        })
        .catch(error => res.status(404).send(error.message));
    })
    .catch(error => res.status(404).send(error.message));
})

module.exports = router;
