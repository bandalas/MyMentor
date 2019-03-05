const Joi = require('joi');

//  General schema and function required for post request
const postSchema = {
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required()
};

function validatePostInput(input) {
    return Joi.validate(input, postSchema);
}

// General schema and function for authenticating admins
const authenticationSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
};

function validateAuthentication(request) {
    return Joi.validate(request, authenticationSchema);
}

module.exports.postValidation = validatePostInput;
module.exports.validateAuthentication = validateAuthentication;
