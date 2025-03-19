const express=require("express");
const router =express.Router({mergeParams:true});
const Review = require("../models/review");
const Listing = require("../models/listing");
const wrapAsync=require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn,isReviewAuthor}=require("../middleware.js");
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router.post("/",validateReview,isLoggedIn,wrapAsync(async(req,res)=>{
    console.log("Received body:", req.body); // ✅ Log the request body
    console.log("Review Data:", req.body.review); // ✅ Log review object
    let listing= await Listing.findById(req.params.id);
    let newReview =new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("New review saved:", newReview); // ✅ Log success
    req.flash("success", "Review created successfully");
    res.redirect(`/listings/${listing._id}`);

}))

router.delete("/:reviewId", isLoggedIn,isReviewAuthor,wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull operator mongoose 
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted successfully");
    res.redirect(`/listings/${id}`);
}));

// router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
//     const { id, reviewId } = req.params;

//     // Ensure the listing exists
//     const listing = await Listing.findById(id);
//     if (!listing) {
//         req.flash("error", "Listing not found.");
//         return res.redirect("/listings");
//     }

//     // Ensure the review exists
//     const review = await Review.findById(reviewId);
//     if (!review) {
//         req.flash("error", "Review not found.");
//         return res.redirect(`/listings/${id}`);
//     }

//     // Remove review reference from the listing
//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

//     // Delete the review
//     await Review.findByIdAndDelete(reviewId);

//     req.flash("success", "Review Deleted successfully");
//     res.redirect(`/listings/${id}`);
// }));


module.exports=router;