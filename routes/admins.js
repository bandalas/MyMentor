const express = require('express');
const router = express.Router();

const auth = require('../middleware/admin-auth');
const Admin = require('./../model/admin');
const Class = require('./../model/class');
const { postValidation, classValidation, reportValidation } = require('./../core/validators/admin-validator');
const { hashPassword } = require('./../core/password-hasher');

/*
    TODO: 
    2. Modify Joi schema for only accepting categories given an array
    3. Store Image
*/
router.post('/signup', (req, res) => {
    try {
        // Checks whether the body of the request is correct;
        var { error } = postValidation(req.body);
        if (error) throw new Error(error.details[0].message);

        hashPassword(req.body.password)
         .then(hashedPassword => {
             // Creating a new instance of the model admin and the
             // hashed password
            const admin = new Admin({
                firstName: req.body.firstName,
                lastName:  req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                institution: req.body.institution,
                semester:  req.body.semester
            });

            // Saving function, async function
            admin.save()
             .then(admin => {
                console.log(admin);
                const token = admin.generateToken();
                res.header('x-auth-token',token).send(admin);
            })
             .catch(error => res.status(404).send(error.message));

         });
    } catch(error) {
        res.status(404).send(error.message);
    }
});

// auth is the middleware function that verifies that the user is logged in
router.get('/dashboard', auth, (req, res) => {
    res.send('Welcome ' + req.admin.name +' ! id: '+ req.admin._id);

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

module.exports = router;
