/*
    Tutor is a special kind of user, therefore we have to extend from the
    User model.
    In mongoose this is achieved with the model.discriminator() function.
*/
const mongoose = require('mongoose');
const User = require('./user');

const category_options = [ 'Lenguas', 'Ciencias' ];

// Tutor inherits everything from User and adds the following for the schema:
const tutorSchema = User.discriminator('Tutor', new mongoose.Schema({
    img: { type: String, data: Buffer, required: true },
    description: { type: String , required: true },
    category: { type: String, enum: category_options },
    gpa: { type: Number, required: true }
}));

const Tutor = mongoose.model('Tutor');
module.exports = Tutor;
