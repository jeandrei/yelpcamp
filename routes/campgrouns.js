const express = require('express');
const router = express.Router();
//aqui ele criou os controllers reestrutura todo o app aula 523
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
//Middlewere que verifica se o usuário está logado aula 510 arquivo /middlewere.ejs
const { isLoggedIn, isAuthor, validateCampground } = require('../middlewere');



//AGRUPAR AS ROTAS aula 525 tudo que é no barra agrupamos para agrupar as rotas NÃO PODE POR ; no final
router.route('/')
    .get(catchAsync(campgrounds.index))
    //SAVE THE DATA SENT FROM THE FORM aula 410
    // validação validateCampground aula 445 schema no arquivo schemas.js validateCampground está aqui no app.js
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

//ADD NEW LOAD THE FORM IMPORTANTE: TEM QUE VIM ANTES DO /:id CASO CONTRÁRIO ELE VAI TRATAR O new como um id
//nessa rota a ordem importa o /campgrounds/new tem que vim antes 
//do /campgrounds/:id caso contrário ele vai tratar o new como um id
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //SHOW
    .get(catchAsync(campgrounds.showCampground))
    //aula 411
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    //remove uma campground
    //para remover todos os reviews da campground foi criado uma middleware CampgroundSchema.post('findOneAndDelete'
    //que executa ao deletar um lá no arquivo models/campground 
    //aula 469
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))



//EDIT
//Get data to show in the form
//isAutor é uma middlewere que verifica se o usuário logado é o autor
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))







module.exports = router;