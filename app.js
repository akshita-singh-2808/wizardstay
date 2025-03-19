const express=require("express");
const app=express();
const mongoose=require("mongoose");
const port=8080;
const Listing = require("./models/listing");
const Photos = require("./models/photo");  
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const{listingSchema, reviewSchema}=require("./schema.js");
const Review = require("./models/review");
const cookieParser = require('cookie-parser');
const session=require("express-session");
const flash=require("connect-flash");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const LocalStrategy=require("passport-local")
const User = require("./models/user.js"); 
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');




const sessionOptions={
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
  }

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser());

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success") ; 
    res.locals.error = req.flash("error") ;
    res.locals.currUser=req.user;
    next();
});


// app.get("/demouser",(async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"studnet1"
//     });

//    let registerdUser= await  User.register(fakeUser,"helloworld");
//    res.send(registerdUser);
// }))

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });

}));



// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wizardstay";
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("Error connecting to DB:", err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}




// app.get("/register",(req,res)=>{
//     let {name}=req.query;
//     req.session.name=name;
//     req.flash("success","user registered successfully")
//     res.send(name);
   
// })

//////////Photo Gallery
app.get("/photos/gallery", wrapAsync(async (req, res) => {
        const allPhotos = await Photos.find({}); 
        res.render("photos/gallery", { allPhotos });
}));

app.get("/photos/gallery",(req,res)=>{
    res.render("photos/gallery");
});

app.post("/photos", wrapAsync(async (req, res) => {
        const newPhoto = new Photos(req.body);
        await newPhoto.save();
        res.redirect("/photos/gallery"); // Redirect to listings page
}));
app.get("/photos/:id", (req, res) => {
    res.render("photos/details", { id: req.params.id });
});

app.delete("/photos/:id",wrapAsync(async(req,res)=>{
    const{id}=req.params;
    await Photos.findByIdAndDelete(id);
    res.redirect("/photos/gallery");
}));

//Custom Error Handling 

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"))
});

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", {
        err: {
            message: message,
            trace: err.stack || "No stack trace available"
        }
    });
});

app.listen(8080,()=>{
    console.log("server is listening to port",port);
});

