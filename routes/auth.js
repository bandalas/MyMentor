const express = require('express');
const router = express.Router();

const Tutor = require('./../model/tutor');
const { validateAuthentication } = require('./../core/validators/tutor-validator');
const { unhashPassword } = require('./../core/password-hasher');


router.post('/', (req, res) => {
    try {
        // Checks whether the body of the request is correct;
        var { error } = validateAuthentication(req.body);
        if (error) throw new Error(error.details[0].message);
        const error_invalid_msg = 'Invalid email or password';

        // Checks if the tutor exists
        Tutor.findOne({ email: req.body.email})
         .then((tutor)=> {
             // Checks if hashed password of the record matches input
             unhashPassword(req.body.password, tutor.password)
                // Returns boolean of whether if the password was valid or not
              .then((validPassword) => {
                  if(!validPassword) return res.status(400).send(error_invalid_msg);

                  // Password matches, thus authentication should be performed
                  const token = tutor.generateTutorToken();
                  res.send(token);
              });
         })
         // No record was found with the given email
         .catch((error) => {
             res.status(400).send(error_invalid_msg);
         });

    } catch(error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;