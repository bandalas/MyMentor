const mongoose = require('mongoose');


const status_options = ['Accepted', 'Rejected', 'Pending', 'Cancelled'];

const bookingSchema = mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    booked_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    date: {type: Date, default: Date.now},
    status: {
        type: String,
        enum: status_options,
        default: 'Pending'
    }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;