const mongoose = require('mongoose');
const options = { discriminatorKey: 'usertype' };
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
    lastName: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
    institution: { type: String, required: true },
    semester: { type: Number, required: true }
}, options);

userSchema.methods.generateTutorToken = function() {
    const token = jwt.sign({ _id: this._id, name: this.firstName }, 'jwtPrivateKey');
    return token;
}

module.exports = mongoose.model('User', userSchema);