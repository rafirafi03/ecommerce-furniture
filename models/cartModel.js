const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new Schema ({

    user: {
        type : ObjectId,
        ref : 'user',
        required : true
    },

    coupon : {
        type : ObjectId,
        ref:'coupon',
    },

    product : [{
        productId : {
            type: ObjectId,
            ref : "products",
            required : true
        },
        quantity: {
            type : Number,
            default: 1,
        }
    }],


})

const cartModel = mongoose.model('cart',cartSchema)
module.exports = cartModel;
