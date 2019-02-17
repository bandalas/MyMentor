const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const auth = require('../middleware/tutor-auth');
const Tutor = require('./../model/tutor');
const { postValidation } = require('./../core/validators/tutor-validator');
const { hashPassword } = require('./../core/password-hasher');

/*
    TODO: 
    2. Modify Joi schema for only acception categories given an array
    3. Store Image
*/
router.post('/signup', (req, res) => {
    try {
        // Checks whether the body of the request is correct;
        var { error } = postValidation(req.body);
        if (error) throw new Error(error.details[0].message);

        hashPassword(req.body.password)
         .then(hashedPassword => {
             // Creating a new instance of the model tutor and the
             // hashed password
            const tutor = new Tutor({
                firstName: req.body.firstName,
                lastName:  req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                institution: req.body.institution,
                semester:  req.body.semester,
                img: req.body.img,
                description: req.body.description,
                category: req.body.category,
                gpa: req.body.gpa
            });

            // Saving function, async function
            tutor.save()
             .then(tutor => {
                console.log(tutor);
                const token = tutor.generateTutorToken();
                res.header('x-auth-token',token).send(tutor);
            })
             .catch(error => res.status(404).send(error.message));

         });
    } catch(error) {
        res.status(404).send(error.message);
    }
});

// auth is the middleware function that verifies that the user is logged in
router.get('/dashboard', auth, (req, res) => {
    res.send('Welcome ' + req.tutor.name +' ! id: '+ req.tutor._id);

});

module.exports = router;