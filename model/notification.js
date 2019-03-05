const mongoose = require('mongoose');

const type_options = ['Booking Accepted', 'Booking Rejected'];

const notificationSchema = new mongoose.Schema({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Student'
	},
	class: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Class'
	},
    seen: { type: Boolean, defualt: false },
    date: { type: Date, default: Date.now },
    type: {
        type: String,
        enum: type_options,
        default: 'Booking Rejected'
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
