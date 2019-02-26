const Joi = require('joi');

const postSchema = {
    comment: Joi.string().required(),
    stars: Joi.number().integer().required()
};

function validatePostInput(input){
    return Joi.validate(input, postSchema);
}

module.exports.postReview = validatePostInput;
