/*
    Tutor is a special kind of user, therefore we have to extend from the
    User model.
    In mongoose this is achieved with the model.discriminator() function.
*/
const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');

const category_options = [ 'Lenguas', 'Ciencias' ];

// Tutor inherits everything from User and adds the following for the schema:
var tutorSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    stars: { type: Number, default: 0 },
    semester: { type: Number, required: true },
    img: { type: String, data: Buffer, required: true },
    description: { type: String , required: true },
    category: { type: String, enum: category_options },
    gpa: { type: Number, required: true }
});

tutorSchema.methods.getAverageRating = async function() {
    const reviews = await Review.find({ tutor: this._id });
    return this.stars / reviews.length;
}

User.discriminator('Tutor', tutorSchema);

const Tutor = mongoose.model('Tutor');
module.exports = Tutor;
