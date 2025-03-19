const Listing=require("./models/listing")
const Review=require("./models/review")


module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create Listing");
        return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl=((req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
})

module.exports.isOwner=(async(req,res,next)=>{
            const { id } = req.params;
            const listing = await Listing.findById(id);
            if (!res.locals.currUser && res.locals.currUser._id.toString() === listing.owner._id.toString()) {
                req.flash("error","OOPS! You are not the Owner");
                return res.redirect("/listings");
            }         
    
            next();
})

module.exports.isReviewAuthor=(async(req,res,next)=>{
     const {id, reviewId } = req.params;
     const listing = await Listing.findById(reviewId);
     const review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","OOPS! You are not the Author");
        res.redirect(`listings/${id}`)
    }
    res.redirect(`listings/${id}`)
    next();
})

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "OOPS! You are not the Author");
        return res.redirect(`/listings/${id}`); 
    }

    next(); 
};
