const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

//agrupar as rotas aula 525 não pode ter ; no final 
router.route('/register')
    .get(users.renderRegister)
    //Aula 508
    .post(catchAsync(users.register))


router.route('/login')
    //Rota para o formulário do login aula 509
    .get(users.renderLogin)
    //Rota para a validação do login
    //passport.authenticate vem da biblioteca passport local é que iremos fazer
    //login no sistema local poderia ser através do google tweeter etc
    //failureFlash é para dar mensagem se algo der errado
    //failureRedirect se algo der errado redireciona para /login
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

//Logout Aula 511
router.get('/logout', users.logout)

module.exports = router;
