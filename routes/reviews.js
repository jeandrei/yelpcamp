const express = require('express');
const router = express.Router({ mergeParams: true });//aula 485 minuto 4.40

//importa a middleware validadeReview
const { validadeReview, isLoggedIn, isReviewAuthor } = require('../middlewere');

//Require campground lá da pasta models que demos um export
const Campground = require('../models/campground');
//Require review model
const Review = require('../models/review');

//controllers aula 534
const reviews = require('../controllers/reviews');


//contem a schema de validação necessário para linha campgroundSchema.validate aula 445
//const { reviewSchema } = require('../schemas.js');

//catchAsync para não precisar fazer try catch em todas as validações nas rotas 
//está em utils/catchAsync lá tem mais informações coloca em todas as rotas com async
const catchAsync = require('../utils/catchAsync');
//Classe para tratamento de erros aula 442
//Essa classe está em utils/ExpressError.js
const ExpressError = require('../utils/ExpressError');



//reviws aula 464
//o caminho para os reviews é /campgrounds/:id/reviews
//porém como definimos que o padrão é esse no app.js
//app.use('/campgrounds/:id/reviews', reviews)
//então podemos apenas colocar / aula 485
router.post('/', isLoggedIn, validadeReview, catchAsync(reviews.createReview))


//APAGAR APENAS UM REVIEW
//Apaga um review precisamos do id do campground aqui também para remover a referência
//que o review tem em campgrounds Aula 468
//o caminho completo é /campgrounds/:id/reviews/:reviewId
//mas como definimos que o padrão é app.use('/campgrounds/:id/reviews', reviews)
//lá no app.js então colocamos só a parte final aula 485
//middlewere isReviewAuthor aula 522
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;