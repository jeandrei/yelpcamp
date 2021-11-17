//CRIAÇÃO DE UM MÓDULO

//damos um require no mongoose
const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');


//damos um require no review
const Review = require('./review');

// criamos uma variavel para a schema pois depois fica mais fácil de chamar
// ao invés de fazer mongoose.Schema.Type se atribuido a uma variável faz apenas Schema.Type
const Schema = mongoose.Schema;


//Thumbnail aula 541
//https://res.cloudinary.com/de6gtuvae/image/upload/w_300/v1636727834/YelpCamp/nra9anctkhfsppkfydu4.png

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

//Criamos uma Schema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }    
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    //reviews aula 462 um campground pode ter vários reviews o model está em reviews.js
    reviews: [
        {
            //reviews é um ObjectId que vem do model review
            //tipo ObjectId vai armazenar todos os ids dos reviews
            type: Schema.Types.ObjectId,
            //referente ao Review model que está declarado em models/reviews.js
            ref: 'Review'
        }
    ]

});


//AO REMOVER UMA CAMPGROUND REMOVER TODOS OS REVIEWS DELA
//aula 469 só executa quando deleta
//quando lá no app.delete(campgrounds/id)
//executa a linha await Campground.findByIdAndDelete(id) ele executa essa middleware
CampgroundSchema.post('findOneAndDelete', async function(doc){
    //console.log(doc);
    if(doc){
        //remove todos os reviews em que o _id exista em doc.reviews array 
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


//Exportamos para poder usar nos outros arquivos
module.exports = mongoose.model('Campground', CampgroundSchema);