//Aula 462 vai ser um relacionamento um para vários
//um campground pode ter vários reviews
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User' //User model
    }
});

module.exports = mongoose.model("Review", reviewSchema);