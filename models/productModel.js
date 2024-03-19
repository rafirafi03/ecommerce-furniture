const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    images:[{
        type : String,
    }],
    quantity: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        default: false
    },
    offerId : {
        type : ObjectId,
        ref : 'offer'
    },
    offerPercentage : {
        type : Number,
        default : null
    }
})

const products = mongoose.model("products",productSchema);
module.exports = products;