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
//catchAsync para não precisar fazer try catch em todas as validações nas rotas 
//está em utils/catchAsync lá tem mais informações coloca em todas as rotas com async
const catchAsync = require('./utils/catchAsync');
//method override necessário para poder usar metodos como DELETE, PUT ?_method=DELETE
//tem que instalar npm i method-override --silent
const methodOverride = require('method-override');
//Require campground lá da pasta models que demos um export
const Campground = require('./models/campground');

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
app.post('/campgrounds', catchAsync(async (req, res, next) => {   
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
app.put('/campgrounds/:id', catchAsync(async (req,res) => {
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

app.use((err,req, res, next) => {
    res.send('Oh boy, something went wrong!');
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})