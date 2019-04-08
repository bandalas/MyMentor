const express = require('express');
const router = express.Router();

const auth = require('../middleware/tutor-auth');
const Tutor = require('./../model/tutor');
const Class = require('./../model/class');
const Review = require('./../model/review');
const Report = require('./../model/report');
const Booking = require('./../model/booking');

const { postValidation, classValidation, reportValidation } = require('./../core/validators/tutor-validator');
const { hashPassword } = require('./../core/password-hasher');

/*
    TODO: 
    3. Store Image
*/

/*
*       Creates a Tutor and stores it in the database
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


/*
*       Fetches all available classes from the tutor given an id
*/
router.get('/classes', auth, (req, res) => {
    Class.find({ tutor: req.tutor._id, availability: true})
     .then(classes => {
        res.json(classes)
     })
     .catch(error => res.json(404).send(error.message));
});

/*
*       Creates a new class for a tutor, given its id 
*/
router.post('/class', auth, (req, res) => {
    var { error } = classValidation(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    Tutor.findOne({ _id: req.tutor._id })
     .then( async tutor => {
         const newClass = new Class({
             tutor: req.tutor._id,
             tutor_rating: await tutor.getAverageRating(),
             name: req.body.name,
             date: req.body.date,
             subject: req.body.subject,
             area: req.body.area,
             description: req.body.description,
             cost: req.body.cost
         });

         newClass.save()
          .then(newClass => {
             console.log(newClass);
             res.json(newClass);
         })
          .catch(error => res.status(404).send(error.message));
        
     })
});


/*
*       Bulk fetch of classes by ids
*/
router.get('/class', auth, (req, res) => {
    const ids = req.query.ids
    Class.find({
        "_id":{ "$in" : ids }
    })
        .then(data => {
            res.send(data);
        })
        .catch(error => res.status(404).send(error));
});
/*
*       Cancels a class given the class id
*/
router.put('/cancel-class/:id', auth, (req, res) => {
    Class.findByIdAndUpdate(req.params.id, {
        availability: false
    }, { new: true })
     .then(canceledClass => {
        console.log(canceledClass);
        res.json(canceledClass);
    })
     .catch(error => res.status(404).send(error.message));
});

router.put('/class/:id', auth, (req, res) => {
    var { error } = classValidation(req.body);
    if (error) return res.status(404).send(error.details[0].message);

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

//          R  E  P  O  R  T  S
router.post('/report-review/:id', auth, (req, res) =>{
    //Check first the input of the user
    var { error } = reportValidation(req.body);
    if (error) throw new Error(error.details[0].message);

    Review.findOne({ _id: req.params.id }).then( review => {
        const report = new Report({
            review: review._id,
            tutor: req.tutor._id,
            description: req.body.description
        });

        report.save()
         .then(review => {
            console.log(report);
            res.json(report);
        })
         .catch(error => res.status(404).send(error.message));
    })
    .catch(error => res.status(404).send(error.message));
});

//Date Filter
router.get('/search/classes', auth, (req, res) => {
    Class.find({tutor: req.tutor._id, 
        date:{
            $gte: req.body.startDate, 
            $lt: req.body.endDate
        }})
    .then(matches => {
        console.log(matches);
        res.json(matches);
     })
     .catch(error => res.status(404).send(error.message));
});

module.exports = router;