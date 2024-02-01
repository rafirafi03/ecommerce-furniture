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
        type: String,
        required: true
    },
    images:{
        image1 : {
            type: String,
            required: true
        },
        image2 : {
            type: String,
            required: true
        },
        image3 : {
            type: String,
            required: true
        },
        image4 : {
            type: String,
            required: true
        }
    },
    quantity: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        default: false
    }
})

const products = mongoose.model("products",productSchema);
module.exports = products;