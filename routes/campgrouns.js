const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
//contem a schema de validação necessário para linha campgroundSchema.validate aula 445
const { campgroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');


//middleware para validar backend campground a schema está em schemas.js
const validateCampground = (req, res, next) => {    
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        //cria uma unica linha com a mensagem de erro
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/', catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//ADD NEW LOAD THE FORM
//nessa rota a ordem importa o /campgrounds/new tem que vim antes 
//do /campgrounds/:id caso contrário ele vai tratar o new como um id
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//SAVE THE DATA SENT FROM THE FORM aula 410
// validação validateCampground aula 445 schema no arquivo schemas.js validateCampground está aqui no app.js
router.post('/', validateCampground, catchAsync(async (req, res, next) => {     
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //aula 444 validação dos dados antes de enviar campgroundSchema é para o joi e não para o mongoose   
    const campground = new Campground(req.body.campground);
    await campground.save();
    //flash está requerido em app.js
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);   
}))

//SHOW
router.get('/:id', catchAsync(async (req,res) => { 
    const campground = await Campground.findById(req.params.id).populate('reviews');    
    if(!campground){//se o campground não existe
        //Aula 490
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

//EDIT
//Get data to show in the form
router.get('/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){//se o campground não existe
        //Aula 490
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

//aula 411
router.put('/:id', validateCampground, catchAsync(async (req,res) => {
    //res.send("IT WORKED!!!");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground });
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))


//remove uma campground
//para remover todos os reviews da campground foi criado uma middleware CampgroundSchema.post('findOneAndDelete'
//que executa ao deletar um lá no arquivo models/campground 
//aula 469
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))


module.exports = router;