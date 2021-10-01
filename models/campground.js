//CRIAÇÃO DE UM MÓDULO

//damos um require no mongoose
const mongoose = require('mongoose');

// criamos uma variavel para a schema pois depois fica mais fácil de chamar
// ao invés de fazer mongoose.Schema.Type se atribuido a uma variável faz apenas Schema.Type
const Schema = mongoose.Schema;


//Criamos uma Schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

//Exportamos para poder usar nos outros arquivos
module.exports = mongoose.model('Campground', CampgroundSchema);