/*
    Student is a special kind of user, therefore we have to extend from the
    User model.
    In mongoose this is achieved with the model.discriminator() function.
*/
const mongoose = require('mongoose');
const User = require('./user');

// Student inherits everything from User and adds the following for the schema:
const studentSchema = User.discriminator('Student', new mongoose.Schema({
    institution: { type: String, required: true },
    semester: { type: Number, required: true },
    img: { type: String, data: Buffer, required: false }
}));

const Student = mongoose.model('Student');
module.exports = Student;
