const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	clase: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Class'
	},
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Student'
	},
    comentario: { type: String, required: true},
    estrella: {type: Number, required: true},
    fecha: {type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
