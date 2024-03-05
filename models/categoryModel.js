const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
      }
})

const category = mongoose.model("category", categoryShema);

module.exports = category;