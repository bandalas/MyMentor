const express = require('express');
const router = express.Router();

const User = require('./../model/user');
const { validateAuthentication } = require('./../core/validators/tutor-validator');
const { unhashPassword } = require('./../core/password-hasher');


router.post('/', (req, res) => {
    try {
        // Checks if the tutor exists
        User.findOne({ email: req.body.email})
         .then((user)=> {
             
             if(!user) return res.send(recordNotFound());
             // Checks if hashed password of the record matches input
             unhashPassword(req.body.password, user.password)
                // Returns boolean of whether if the password was valid or not
              .then((validPassword) => {
                  if(!validPassword) return res.send(recordNotFound());

                  // Password matches, thus authentication should be performed
                  const token = user.generateToken();
                  const response_body = {
                      'token': token,
                      'user': user,
                      'type': user.usertype
                  }
                  res.send(response_body);
              })
              .catch((error) => {
                  return res.send(recordNotFound());
              });
         })
         // No record was found with the given email
         .catch((error) => {
             return res.send(recordNotFound());
         });

    } catch(error) {
        res.status(404).send(error.message);
    }
});

function recordNotFound() {
    return { 'record_not_found': true };
}

module.exports = router;