const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    criteria: {
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

const coupon = mongoose.model('coupon',couponSchema);

module.exports = coupon;