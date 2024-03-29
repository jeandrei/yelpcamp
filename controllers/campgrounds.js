//controllers seção 53

const Campground = require('../models/campground');

//mbxGeocoding aula 543
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken:mapBoxToken });

const { cloudinary } = require('../cloudinary');

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {  
    res.render('campgrounds/new');   

}

module.exports.createCampground = async (req, res, next) => {     
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();    
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //aula 444 validação dos dados antes de enviar campgroundSchema é para o joi e não para o mongoose   
    const campground = new Campground(req.body.campground);
    //Geometry tem que assistir todas as aulas dessa sessão começa em 542
    campground.geometry = geoData.body.features[0].geometry;
    //upload de imagens a partir da aula 528 muito difícil explicar aqui
    campground.images = req.files.map(f=> ({ url: f.path, filename: f.filename })); 
    //campground.author é o autor do campground aula 515
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    //flash está requerido em app.js
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);   
}

module.exports.showCampground = async (req,res) => { //populate author aula 515 na aula 522 ele muda tudo para popular os reviews com o autor
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
   // console.log(campground);
    if(!campground){//se o campground não existe
        //Aula 490
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');    
    }    
    //console.log(campground);
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){//se o campground não existe
        //Aula 490
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }    
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req,res) => {
    //res.send("IT WORKED!!!");
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id,{ ...req.body.campground });
    //Aula 536
    const imgs = req.files.map(f=> ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); 
    await campground.save();
    //Deletar imagens aula 539 e 540
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images:{ filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}