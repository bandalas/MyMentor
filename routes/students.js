const express = require('express');
const router = express.Router();

const auth = require('../middleware/student-auth');
const Student = require('./../model/student');
const { postValidation } = require('./../core/validators/student-validator');
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

module.exports = router;