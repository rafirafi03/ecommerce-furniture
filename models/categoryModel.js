const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = require('mongodb');


const categoryShema = new Schema ({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String,
    },
    isListed: {
        type: Boolean,
        default: false,
    },
    offerId : {
        type : ObjectId,
        ref : 'offer'
    }
    
})

const category = mongoose.model("category", categoryShema);

module.exports = category;