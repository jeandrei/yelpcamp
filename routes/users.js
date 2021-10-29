const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register')
})

//Aula 508
router.post('/register', catchAsync(async (req, res, next) => {
    //res.send(req.body);
    try{
        const { email, username, password } = req.body;
        const user = new User( {email, username });
        const registeredUser = await User.register(user, password);
        //após registrar efetuamos o login aula 513
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        }) 
    } catch (e){
        req.flash('error', e.message);
        res.redirect('register');
    }
    
}));

//Rota para o formulário do login aula 509
router.get('/login', (req, res) => {
    res.render('users/login')
});

//Rota para a validação do login
//passport.authenticate vem da biblioteca passport local é que iremos fazer
//login no sistema local poderia ser através do google tweeter etc
//failureFlash é para dar mensagem se algo der errado
//failureRedirect se algo der errado redireciona para /login
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    //se não tiver url para redirecionar redireciona para campgrounds
    //esse returnTo vem la da middlewere.js aula 514
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //depois deletamos o returnTo da session para retornar para
    //onde o usuário tentou acessar sem login apenas uma vez
    //caso contrário toda vez irira retornar para lá
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

//Logout Aula 511
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;
