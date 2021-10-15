//Require o express
const express = require('express');
//atribuimos a uma constante path o caminho da aplicação
const path = require('path');
/**
 * *******************************************
 * IMPORTANTE MONGOOSE REQUER NODE 12 OU ACIMA
 * *******************************************
 */
//Require no mongoose
const mongoose = require('mongoose');
// ejs-mate para criação de layout tem que instalar
// npm i ejs-mate --silent
const ejsMate = require('ejs-mate');
//joi npm i joi - biblioteca para validação aula 444
const Joi = require('joi');
//contem a schema de validação necessário para linha campgroundSchema.validate aula 445
const { campgroundSchema } = require('./schemas.js');
//catchAsync para não precisar fazer try catch em todas as validações nas rotas 
//está em utils/catchAsync lá tem mais informações coloca em todas as rotas com async
const catchAsync = require('./utils/catchAsync');
//Classe para tratamento de erros aula 442
//Essa classe está em utils/ExpressError.js
const ExpressError = require('./utils/ExpressError');

//method override necessário para poder usar metodos como DELETE, PUT ?_method=DELETE
//tem que instalar npm i method-override --silent
const methodOverride = require('method-override');
//Require campground lá da pasta models que demos um export
const Campground = require('./models/campground');
const { join } = require('path');



//morgan aula 415 - ajuda na depuração de erros
//instala npm i morgan --silent
//const morgan = require('morgan');
//app.use(morgan('tiny'));



//middleware app.use/next() aula 416
//app.use é chamado em todas as requisições então se precisar que algo sempre seja executado
//NA REQUISIÇÃO OU SEJA SÓ QUANDO ATUALIZAR A PÁGINA
//use o app.use porem ele executa o primeiro e para a execução para continuar tem que usar o next

//Conectamos ao banco de dados mongoose
//no curso abaixo de useNewUrlParser ele colocou useCreateIndex: true, 
//mas não é mais suportado
mongoose.connect('mongodb://localhost:27017/yelp-camp',{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Atribuimos o express a uma variável app
const app = express();

//Definimos que o app irá usar como engine o ejs mate que está declarado lá em cima
//os layouts ficarao na pasta views/layouts
app.engine('ejs', ejsMate);


//Configuramos a pasta views como padrão e definimos o ejs como o view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//parse de request body necessário para enviar os dados pelo post req.body aula 410
//fala para o express todas as requisições use essa função especial urlencoded
app.use(express.urlencoded({extended: true}))
//string que será usada para identificar o method override ?_method=DELETE
app.use(methodOverride('_method'));


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


app.get('/', (req,res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

//ADD NEW LOAD THE FORM
//nessa rota a ordem importa o /campgrounds/new tem que vim antes 
//do /campgrounds/:id caso contrário ele vai tratar o new como um id
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//SAVE THE DATA SENT FROM THE FORM aula 410
// validação validateCampground aula 445 schema no arquivo schemas.js validateCampground está aqui no app.js
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {   
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //aula 444 validação dos dados antes de enviar campgroundSchema é para o joi e não para o mongoose   
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);   
}))

//SHOW
app.get('/campgrounds/:id', catchAsync(async (req,res) => { 
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}))

//EDIT
//Get data to show in the form
app.get('/campgrounds/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

//aula 411
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req,res) => {
    //res.send("IT WORKED!!!");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



//Se for chamado uma rota/página inexistente sempre vai cair aqui aula 442
//vai criar um objeto ExpressError lá do arquivo utils/ExpressError.js 
//o next vai passar para a linha abaixo app.use na variável err
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req, res, next) => {
    //os valores de err vem do app.all
    //os valores de statusCode e message vai ser passada por err de app.all mas na verdade vem lá
    //do ExpressError
    //passa o que tem em err para statusCode se não tiver nada passa 500 valor defoult
    const { statusCode = 500 } = err;
    // se não tiver nada em err.message passa Ho no something went wrong
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    //render a pagina error.ejs passando a variavel err que vai conter o erro e o código status
    res.status(statusCode).render('error', { err });   
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})