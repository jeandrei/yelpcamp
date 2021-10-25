const express = require('express');
const router = express.Router({ mergeParams: true });//aula 485 minuto 4.40

//Require campground lá da pasta models que demos um export
const Campground = require('../models/campground');
//Require review model
const Review = require('../models/review');

//contem a schema de validação necessário para linha campgroundSchema.validate aula 445
const { reviewSchema } = require('../schemas.js');

//catchAsync para não precisar fazer try catch em todas as validações nas rotas 
//está em utils/catchAsync lá tem mais informações coloca em todas as rotas com async
const catchAsync = require('../utils/catchAsync');
//Classe para tratamento de erros aula 442
//Essa classe está em utils/ExpressError.js
const ExpressError = require('../utils/ExpressError');


//middleware para validar backend review a schema está em schemas.js
const validadeReview = (req, res, next) => {
    const { error }  = reviewSchema.validate(req.body);  
    if(error){
         //cria uma unica linha com a mensagem de erro
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     } else {
         next();
     }
 }




//reviws aula 464
//o caminho para os reviews é /campgrounds/:id/reviews
//porém como definimos que o padrão é esse no app.js
//app.use('/campgrounds/:id/reviews', reviews)
//então podemos apenas colocar / aula 485
router.post('/', validadeReview, catchAsync(async (req, res) => {
    //find the correspond campground that we want to add the review to
    const campground = await Campground.findById(req.params.id);
    //Create a new review
    const review = new Review(req.body.review);
    //push into the campground.reviews defined in the models/CampgroundSchema/reviews:[]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    /**
     * A validação backend está lá no arquivo schemas.js
     * module.exports.reviewSchema = Joi.object({
     * Aula 465
     */
}))


//APAGAR APENAS UM REVIEW
//Apaga um review precisamos do id do campground aqui também para remover a referência
//que o review tem em campgrounds Aula 468
//o caminho completo é /campgrounds/:id/reviews/:reviewId
//mas como definimos que o padrão é app.use('/campgrounds/:id/reviews', reviews)
//lá no app.js então colocamos só a parte final aula 485
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId } = req.params;
    //1ºremovo as referências desse review lá no campground para isso
    //localizo o campground em modo update passando um objeto que contêm 
    //um id e um método pull pull remove itens de um array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;