const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const wishlistSchema = new Schema ({
    user : {
        type: ObjectId,
        ref : 'user',
        required : true
    },

    product : [{
        productId : {
            type : ObjectId,
            ref : 'products',
            required : true
        }
    }]
})


const wishlistModel = mongoose.model('wishlist',wishlistSchema)
module.exports = wishlistModel;