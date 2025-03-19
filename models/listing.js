const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js")
const User=require("./user.js")
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true, 
    },
    description: {
        type: String,
        required: true,
        maxlength: 500, 
    },
    image: {
        filename: {
          type: String,
          default: "defaultimage"
        },
        url: {
          type: String,
          default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        }
      },
  price: {
    
    type: Number,
    min: [0, 'Price cannot be less than zero'], 
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true, 
  },
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner:
    {
      type:Schema.Types.ObjectId,
      ref:"User"
    }
  // category:{
  //   type:String,
  //   required:true
  // }
  


});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}})
  }

})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
