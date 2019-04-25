const express = require('express');
const router = express.Router();

const auth = require('../middleware/admin-auth');
const Student = require('./../model/student');
const Tutor = require('./../model/tutor');
const Admin = require('./../model/admin');
const Report = require('./../model/report');
const Class = require('./../model/class');
const querystring = require('query-string');
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


router.get('/classes', auth, (req, res) => {
    const q = params(req.url);

    Class.find().skip(q.skip).limit(q.limit).sort(q.sort)
      .then(classes => {
        let arrClasses = classes.map(renameId);
        //console.log(arrClasses);

        Class.countDocuments()
          .then(count => {
            res.header('X-Total-Count', count).json(arrClasses);
          })
          .catch(error => res.status(400).send(error.message))
      })
      .catch(error => res.status(400).send(error.message));
});

router.get('/tutors', auth, (req, res) => {
    const q = params(req.url);

    Tutor.find().skip(q.skip).limit(q.limit).sort(q.sort)
      .then(tutors => {
        let arrTutors = tutors.map(renameId);
        console.log(arrTutors);

        Tutor.countDocuments()
          .then(count => {
            res.header('X-Total-Count', count).json(arrTutors);
          })
          .catch(error => res.status(400).send(error.message))
      })
      .catch(error => res.status(400).send(error.message));
});

router.get('/reports', auth, (req, res) => {
    const q = params(req.url);

    Report.find().skip(q.skip).limit(q.limit).sort(q.sort)
     .then(reports => {
        let arrReports = reports.map(renameId);
        console.log(arrReports);
        
        Report.countDocuments()
          .then(count => {
            res.header('X-Total-Count', count).json(arrReports);
          })
          .catch(error => res.status(400).send(error.message))
     })
     .catch(error => res.json(400).send(error.message));
});

// Front-end requires renamed key
function renameId(dict) {
    let obj = dict.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
}

function params(url) {
    const query = querystring.parse(url.replace(/^.*\?/, ''));

    const sort = {};
    sort[query._sort] = query._order === 'ASC' ? 1 : -1;
    return {
        skip: parseInt(query._start),
        limit: parseInt(query._end - query._start),
        sort: sort
    }
}

module.exports = router;
