/*
    Admin is a special kind of user, therefore we have to extend from the
    User model.
    In mongoose this is achieved with the model.discriminator() function.
*/
const mongoose = require('mongoose');
const User = require('./user');

// Admin inherits everything from User and adds the following for the schema:
const adminSchema = User.discriminator('Admin', new mongoose.Schema({
    img: { type: String, data: Buffer, required: false }
}));

const Admin = mongoose.model('Admin');
module.exports = Admin;
