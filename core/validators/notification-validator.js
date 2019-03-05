const Joi = require('joi');

const postSchema = {
    seen: Joi.boolean().required(),
    date: Joi.any().optional(),
    type: Joi.string().required()
};

function validatePostInput(input) {
    return Joi.validate(input, postSchema);
}

module.exports.postValidation = validatePostInput;
