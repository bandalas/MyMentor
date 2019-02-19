const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
	tutor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tutor'
	},
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    date: { type: Date, required: true, unique: false },
    subject: { type: String, required: true, unique: false },
    area: { type: String, required: true },
    availability: { type: Array, default: [], required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true }
});

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
