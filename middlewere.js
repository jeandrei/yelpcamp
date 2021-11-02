//OBS.: O CORRETO É CRIAR UM ARQUIVO DE MIDDLEWERE PARA CADA COISA
//EXEMPLO USERSMIDDLEWERE, CAMPGROUNDSMIDDLEWERE ETC
//tem que importar na rota
//exemplo: const { isLoggedIn, isAuthor, validateCampground } = require('../middlewere');


//contem a schema de validação necessário para linha campgroundSchema.validate aula 445
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//middlewere para verificar se o usuário está logado aula 510
//se der um console.log(req.user) vai vim id, username e email do usuário
module.exports.isLoggedIn = (req, res, next) => {
    //console.log("REQ.USER...", req.user);
    if(!req.isAuthenticated()){
        //retornar para a página que o usuário tentou acessar antes do login
        //uso no routes/user.js/router.post
        //req.session.returnTo depois uso no app.js app.use((req, res, next) aula 514
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    } 
    next();
}

//middleware para validar backend campground a schema está em schemas.js
module.exports.validateCampground = (req, res, next) => {    
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        //cria uma unica linha com a mensagem de erro
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//middleware para verificar se um campground é do usuáiro logado
//para permitir ou negar alteração
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    //busco o campground no bd para verificar se o mesmo pertence ao usuário logado aula 517
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        //usa o return para impedir que o código prossiga
        return res.redirect(`/campgrounds/${id}`);
    } 
    next() ;
}

//middleware para verificar se um review é do usuáiro logado
//para permitir ou negar alteração aula 522
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;//reviewId vem lá de routers/reviews router.delete('/:reviewID')
    //busco o campground no bd para verificar se o mesmo pertence ao usuário logado aula 517
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        //usa o return para impedir que o código prossiga
        return res.redirect(`/campgrounds/${id}`);
    } 
    next() ;
}

//middleware para validar backend review a schema está em schemas.js
module.exports.validadeReview = (req, res, next) => {
    const { error }  = reviewSchema.validate(req.body);  
    if(error){
         //cria uma unica linha com a mensagem de erro
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     } else {
         next();
     }
 }
