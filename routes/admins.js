const express = require('express');
const router = express.Router();

const auth = require('../middleware/admin-auth');
const dashboard = require('./dashboard');

const Admin = require('./../model/admin');
const { postValidation } = require('./../core/validators/admin-validator');
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
            });

            // Saving function, async function
            admin.save()
             .then(admin => {
                console.log(admin);
                const token = admin.generateToken();
                res.header('x-auth-token',token).send(admin);
            })
             .catch(error => res.status(400).send(error.message));

         });
    } catch(error) {
        res.status(400).send(error.message);
    }
});

// auth is the middleware function that verifies that the user is logged in
router.get('/dashboard', auth, (req, res) => {
    res.send('Welcome ' + req.admin.name +' ! id: '+ req.admin._id);

});

router.use('/tutors/', (req, res, next) => { 
    res.locals.model = 'tutor';
    next();
}, dashboard);

router.use('/students/', (req, res, next) => { 
    res.locals.model = 'student';
    next();
}, dashboard);

router.use('/reports/', (req, res, next) => { 
    res.locals.model = 'report';
    next();
}, dashboard);

router.use('/classes/', (req, res, next) => { 
    res.locals.model = 'class';
    next();
}, dashboard);

router.use('/reviews/', (req, res, next) => { 
    res.locals.model = 'review';
    next();
}, dashboard);

module.exports = router;
