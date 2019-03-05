const mongoose = require('mongoose');
const options = { discriminatorKey: 'usertype' };
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minlength: 3, maxlength: 100 },
    lastName: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true},
}, options);

userSchema.methods.generateToken = function() {
    const token = jwt.sign({ _id: this._id, name: this.firstName, type: this.usertype}, 'jwtPrivateKey');
    return token;
}

module.exports = mongoose.model('User', userSchema);
