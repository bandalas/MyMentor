const express = require('express');
const router = express.Router();

const auth = require('../middleware/tutor-auth');
const Tutor = require('./../model/tutor');
const Class = require('./../model/class');
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
                const token = tutor.generateToken();
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

router.get('/classes', auth, (req, res) => {
    const classes = Class.find({ tutor: req.tutor._id }).exec(function(err, classes) {
        if(!classes.length) {
            console.log([]);
            res.json([]);
        }

        let arrClasses = classes.map(c => c.toObject());
        console.log(arrClasses);
        res.json(arrClasses);
    });
});

router.post('/class', auth, (req, res) => {
    const newClass = new Class({
        tutor: req.tutor._id,
        name: req.body.name,
        date: req.body.date,
        subject: req.body.subject,
        area: req.body.area,
        availability: req.body.availability,
        description: req.body.description,
        cost: req.body.cost
    });

    newClass.save()
     .then(newClass => {
        console.log(newClass);
        res.json(newClass);
    })
     .catch(error => res.status(404).send(error.message));
});

router.delete('/class/:id', auth, (req, res) => {
    Class.findByIdAndDelete(req.params.id)
     .then(deletedClass => {
        console.log(deletedClass);
        res.json(deletedClass);
    })
     .catch(error => res.status(404).send(error.message));
});

router.put('/class/:id', auth, (req, res) => {
    Class.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        date: req.body.date,
        subject: req.body.subject,
        area: req.body.area,
        availability: req.body.availability,
        description: req.body.description,
        cost: req.body.cost
    }, { new: true })
     .then(updatedClass => {
        console.log(updatedClass);
        res.json(updatedClass);
     })
     .catch(error => res.status(404).send(error.message));
});

module.exports = router;