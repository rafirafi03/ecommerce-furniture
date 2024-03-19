const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    activation_date: {
        type: String,
        required: true
    },
    expiry_date: {
        type: String,
        required: true
    }
});

const offer = mongoose.model('offer',offerSchema);

module.exports = offer;