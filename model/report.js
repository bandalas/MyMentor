/*
    Report model
    For reporting inappropiate student reviews (with a valid reason).
    For tutor use only.
*/
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
    },
    tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor'
    },
    description: { type: String, required: true }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
