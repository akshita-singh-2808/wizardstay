const express=require("express");
const router =express.Router();
const Listing = require("../models/listing");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const{listingSchema, reviewSchema}=require("../schema.js");
const Review = require("../models/review");
const { isLoggedIn,isOwner } = require("../middleware.js");



const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};



//All listings
router.get("/", wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
   
})); //Mew route
router.get("/new", isLoggedIn, (req, res) => {
   
    res.render("listings/new");
});
//create route
router.post("/",
    isLoggedIn,
    wrapAsync(async (req, res,next) => {
        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id
         let result=listingSchema.validate(req.body);
         console.log(result);
         if(res.error){
            throw new ExpressError(400,result.error);
         }
        //  const newListing = new Listing(req.body);
         await newListing.save();
         req.flash("success","new listing created");
         res.redirect("/listings")
    })
);
router.get("/abstract", (req, res) => {
    res.render("listings/abstract");
});
//show listing information route
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author", // Ensures review author is populated
        }
    })
    .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");  
    }
    res.render("listings/show", { listing });
}));

//edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "OOPS! You don't have permission to edit");
        return res.redirect("/listings");  // ✅ Prevent further execution
    }

    res.render("listings/edit.ejs", { listing });
}));

// router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
//     const { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing || !res.locals.currUser || res.locals.currUser._id.toString() !== listing.owner._id.toString()) {
//         req.flash("error", "OOPS! You don't have permission to edit");
//         return res.redirect("/listings");  // ✅ Add `return` to prevent multiple responses
//     }

//     res.render("listings/edit.ejs", { listing });
// }));


// //update route
router.put("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    if (!req.body) { 
        throw new ExpressError(400, "Send valid data for listing");
    }
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body }, { new: true, runValidators: true });
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
}));


//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
        const{id}=req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success","listing deleted");
        res.redirect("/listings");
}));






module.exports=router;