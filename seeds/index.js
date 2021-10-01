const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptions, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//vai gerar randomicamente uma consta sample com valores la do arquivo seedHelpers
//vai trazer descriptors e places
const sample = array => array[Math.floor(Math.random() * array.length)];

//Criamos uma constante seeDB removendo tudo o que tem no BD e criando um novo registro
//ela por si não faz nada tem que executar
const seedDB = async () => {
    //Removemos tudo do bandco de dados
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        //gera um número de 0 a 1000
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Earum, architecto. Sint iure reprehenderit iste reiciendis incidunt sapiente corporis deleniti dolores animi ab veritatis nemo odio praesentium, consequuntur, ut beatae deserunt?',
            price: price
        })
        await camp.save();
    }
}

//aqui executamos a constante e vai efetivamente realizar as alterações no BD
//quando executarmos o arquivo node /seeds/index.js
seedDB().then(() => {
    //encerramos a conexão com o banco de dados
    mongoose.connection.close();
})

