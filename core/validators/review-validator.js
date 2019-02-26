const Joi = require('joi');

const postSchema = {
    comentario: Joi.string().required(),
    estrella: Joi.number().integer().required()
};

function validatePostInput(input){
    return Joi.validate(input, postSchema);
}

module.exports.validatePostInput = validatePostInput;
