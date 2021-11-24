//Aula 531 para entender isso tem influencia no arquivo error.ejs
/* if(process.env.NODE_ENV !== "production"){
    require('dotenv').config(); ele desativou na aula 567 não entendi pq
} */
    require('dotenv').config();

//console.log(process.env.SECRET);
//console.log(process.env.API_KEY);


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

/**
 * AUTENTICAÇÃO Aula 504
 * usaremos:
 * passport http://www.passportjs.org
 * Passport-Local http://www.passportjs.org/packages/passport-local
 * passport-local-mongoose https://www.npmjs.com/package/passport-local-mongoose
 * npm install passport passport-local passport-local-mongoose
 * 1-cria um model user.js
 * 2 - Require passport e passport-local
 * 3 - Require User Model
 * 4 - abaixo da session app.use(flash()); iniciamos o passport
 * app.use(passport.initialize()) e app.use(passport.session());
 * 5 - na pasta routers criamos um arquivo de rotas users.js
 * 5 - Cria os formulários views/users e rotas routes/users
 * /register - Form
 * POST /register - cria um usuário
 * 6 - Require users route
 * 
 */
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//npm i express-mongo-sanitize proibe o equivalente a sql injection
//aula 563
const mongoSanitize = require('express-mongo-sanitize');

//npm i helmet aula 568
const helmet = require('helmet');


//******************ROTAS importadas da pasta routes******************
//Requer a rota para campground arquivo /routes/campgrounds.js aula 484
const campgroundRoutes = require('./routes/campgrouns');
//mesma coisa da linha de cima só que para as rotas do review
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

/*****************CONEXÃO COM O BANCO DE DADOS *************/
//Conectamos ao banco de dados mongoose
//no curso abaixo de useNewUrlParser ele colocou useCreateIndex: true, 
//mas não é mais suportado


//Quando estiver em produção descomente a linha abaixo dados em cloud mongo Atlas aula 570
//const dbUrl = process.env.DB_URL;

//Quando estiver em desenvolvimento descomente a linha abaixo
const dbUrl = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl,{ 
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

//proibe o equivalente ao sql injection aula 563
app.use(mongoSanitize());

//Session Aula 487
const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, descomente essa linha quando publicar o site aula 566
        //1000 milisegundos em um segundo * 60 segundos= 1 minuto
        // * 60 minutos em uma hora * 24 horas = 1dia * 7 dias da semana
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

//helmet segurança aula 568 e 569
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",   
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/de6gtuvae/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! de6gtuvae é o nome da conta no claudinary 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//Autenticação Aula 506
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware para apresentar a flash aula 488
//res.locals são como variáveis globais que tenho acesso em todos os templates
app.use((req, res, next) => {
    //console.log(req.query);
    //se quiser verificar o que está sendo passado pela session
    //console.log(req.session);
    //aula 512 currentUser helper na linha abaixo vou passar
    //o id, username e email para ter acesso em todos os templates
    res.locals.currentUser = req.user;
    //sejá lá o que esteja em res.locals.success teremos acesso no boilertemplate, não tem que passar
    //em toda request vamos pegar seja la o que tiver em req.flash('success') e passar 
    //em locals na chave success <%= success %>
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//********************USA AS ROTAS IMPORTADAS DA PASTA ROUTES******* */
app.use('/', userRoutes);
//rota para campgrounds tem que dar um require('./routes/campgrouns') lá em cima
app.use('/campgrounds', campgroundRoutes);
//mesma coisa da linha acima só que para os reviews
app.use('/campgrounds/:id/reviews', reviewsRoutes);


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
























