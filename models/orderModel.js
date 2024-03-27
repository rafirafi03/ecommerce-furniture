const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new Schema({

    user: {
        type: ObjectId,
        ref: 'user',
        required: true
    },

    deliveryAddress: {
        type: Object,
        required: true
    },

    payment: {
        type: String,
        required: true,
        method: ['Cash on delivery', 'Razorpay', 'Wallet']
    },

    product: [{
        productId: {
            type: ObjectId,
            ref: "products",
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
        },
        price: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            dafault: 'pending',
            enum: ['pending', 'placed', 'out for delivery', 'shipped', 'delivered', 'Cancelled', 'returned','return requested','return declined']
        },
        returnReason : {
            type : String
        }
    }],

    shippingCharge: {
        type: Number,
    },

    discountAmount: {
        type: Number,
    },

    totalPrice: {
        type: Number,
        required: true
    },

    orderStatus: {
        type: String,
        dafault: 'pending',
        enum: ['pending', 'placed', 'out for delivery', 'shipped', 'delivered', 'Cancelled', 'returned']
    },

    orderDate: {
        type: Date,
        required: true
    },
});

const order = mongoose.model('order', orderSchema);
module.exports = order;
