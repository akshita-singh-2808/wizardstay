const mongoose=require("mongoose");
const initData=require("./data.js");
const photosData=require("./photoData.js");
const Listing = require("../models/listing.js");
const Photos  = require("../models/photo.js");
const User=require("../models/user.js")

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
const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"67d5a42351bdf1c4d40bed8f"}));
    await Listing.insertMany(initData.data);//we are accesing the key data from data.js
    await Photos.deleteMany({});
    await Photos.insertMany(photosData.data);
    console.log("data was initialised");

}
initDB();