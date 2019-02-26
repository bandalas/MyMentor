const mongoose = require('mongoose');

const reseñaSchema = new mongoose.Schema({
	tutor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tutor'
	},
    comentario: { type: String, required: true},
    estrella: {type: Number, required: true},
    fecha: {type: Date, required: true}
});

const Reseña = mongoose.model('Reseña', reseñaSchema);
module.exports = Reseña;