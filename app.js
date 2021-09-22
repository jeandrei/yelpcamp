//Require o express
const express = require('express');
//atribuimos a uma constante path o caminho da aplicação
const path = require('path');
//Require no mongoose
const mongoose = require('mongoose');
//Require campground lá da pasta models que demos um export
const Campground = require('./models/campground');



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


//Configuramos a pasta views como padrão e definimos o ejs como o view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req,res) => {
    res.render('home');
})

app.get('/makecampground', async (req,res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'cheap caming!'});
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})