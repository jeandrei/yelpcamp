//Require o express
const express = require('express');
//atribuimos a uma constante path o caminho da aplicação
const path = require('path');
/**
 * *******************************************
 * IMPORTANTE MONGOOSE REQUER NODE 12 OU ACIMA
 * para instalar as dependencias automaticamente execute npm install
 * express router para separar as rotas bem importante aula 471 e 472
 * *******************************************
 */
//Require no mongoose
const mongoose = require('mongoose');
// ejs-mate para criação de layout tem que instalar
// npm i ejs-mate --silent
const ejsMate = require('ejs-mate');

//tem que instalar npm i express-session
const session = require('express-session');

//npm i connect-flash
const flash = require('connect-flash');

//Classe para tratamento de erros aula 442
//Essa classe está em utils/ExpressError.js
const ExpressError = require('./utils/ExpressError');


//method override necessário para poder usar metodos como DELETE, PUT ?_method=DELETE
//tem que instalar npm i method-override --silent
const methodOverride = require('method-override');


//******************ROTAS importadas da pasta routes******************
//Requer a rota para campground arquivo /routes/campgrounds.js aula 484
const campgrounds = require('./routes/campgrouns');
//mesma coisa da linha de cima só que para as rotas do review
const reviews = require('./routes/reviews');


/*****************CONEXÃO COM O BANCO DE DADOS *************/
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

//Define um caminho estático para a pasta public
//dessa forma podemos apenas chamar tudo o que está dentro de /public
//apenas pelo nome do arquivo exemplo <script src="arquivo.js">
app.use(express.static(path.join(__dirname, 'public')));

//Session Aula 487
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //1000 milisegundos em um segundo * 60 segundos= 1 minuto
        // * 60 minutos em uma hora * 24 horas = 1dia * 7 dias da semana
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());



//middleware para apresentar a flash aula 488
app.use((req, res, next) => {
    //sejá lá o que esteja em res.locals.success teremos acesso no boilertemplate, não tem que passar
    //em toda request vamos pegar seja la o que tiver em req.flash('success') e passar 
    //em locals na chave success <%= success %>
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//********************USA AS ROTAS IMPORTADAS DA PASTA ROUTES******* */
//rota para campgrounds tem que dar um require('./routes/campgrouns') lá em cima
app.use('/campgrounds', campgrounds);
//mesma coisa da linha acima só que para os reviews
app.use('/campgrounds/:id/reviews', reviews);

//***************ROUTES************** */

app.get('/', (req,res) => {
    res.render('home');
})


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


//morgan aula 415 - ajuda na depuração de erros
//instala npm i morgan --silent
//const morgan = require('morgan');
//app.use(morgan('tiny'));



//middleware app.use/next() aula 416
//app.use é chamado em todas as requisições então se precisar que algo sempre seja executado
//NA REQUISIÇÃO OU SEJA SÓ QUANDO ATUALIZAR A PÁGINA
//use o app.use porem ele executa o primeiro e para a execução para continuar tem que usar o next
























