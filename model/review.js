const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	class: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Class'
	},
	tutor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Tutor'
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Student'
	},
    comment: { type: String, required: true},
    stars: {type: Number, required: true},
    date: {type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
