//Require campground lá da pasta models que demos um export
const Campground = require('../models/campground');
//Require review model
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    //find the correspond campground that we want to add the review to
    const campground = await Campground.findById(req.params.id);
    //Create a new review
    const review = new Review(req.body.review);
    //coloco o id do usuário que criou o review aula 519
    review.author = req.user._id;
    //push into the campground.reviews defined in the models/CampgroundSchema/reviews:[]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
    /**
     * A validação backend está lá no arquivo schemas.js
     * module.exports.reviewSchema = Joi.object({
     * Aula 465
     */
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId } = req.params;
    //1ºremovo as referências desse review lá no campground para isso
    //localizo o campground em modo update passando um objeto que contêm 
    //um id e um método pull pull remove itens de um array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}