const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

const addressSchema = new Schema({

    user : {
        type : ObjectId,
        ref : "user",
        required : true

    },

    address : [{
        fullName : {
            type : String,
            required : true
        },
        country : {
            type : String,
            required : true
        },
        address : {
            type : String,
            required : true
        },
        district : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        pincode : {
            type : Number,
            required : true
        },
        mobile : {
            type : Number,
            required : true
        },
        email : {
            type : String,
            required : true
        }
    }]
    
    
});

const address = mongoose.model('address',addressSchema);
module.exports = address;