const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new Schema ({

    user: {
        type : ObjectId,
        ref : 'user',
        required : true
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
        },
        price : {
            type : Number,
            required : true
        },
        totalPrice : {
            type : Number,
            required : true
        }
    }]

})

const cartModel = mongoose.model('cart',cartSchema)
module.exports = cartModel;
