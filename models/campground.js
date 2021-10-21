//CRIAÇÃO DE UM MÓDULO

//damos um require no mongoose
const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');

//damos um require no review
const Review = require('./review');

// criamos uma variavel para a schema pois depois fica mais fácil de chamar
// ao invés de fazer mongoose.Schema.Type se atribuido a uma variável faz apenas Schema.Type
const Schema = mongoose.Schema;


//Criamos uma Schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
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