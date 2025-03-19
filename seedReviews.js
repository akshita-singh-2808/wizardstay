const mongoose = require("mongoose");
const faker = require("@faker-js/faker").faker;
const Review = require("./models/review");
const Listing = require("./models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/wizardstay")
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.log("❌ DB Connection Error:", err));

const generateReviews = async () => {
    const listings = await Listing.find({}); // Fetch all listings

    if (listings.length === 0) {
        console.log("❌ No listings found! Add listings first.");
        mongoose.connection.close();
        return;
    }

    let fakeReviews = [];

    for (let i = 0; i < 22; i++) { // Adjust the number of reviews
        let randomListing = listings[Math.floor(Math.random() * listings.length)]; // Pick a random listing

        let review = new Review({
            body: faker.lorem.sentences(2),
            rating: Math.floor(Math.random() * 5) + 1, // Random rating (1-5)
            author: new mongoose.Types.ObjectId("67db207116c18b2e403fe878") // Replace with a real user ID
        });

        await review.save(); // First, save the review
        randomListing.reviews.push(review._id); // Push only the ObjectId
        await randomListing.save(); // Save updated listing
        fakeReviews.push(review);
    }

    console.log("✅ Fake reviews added successfully!");
    mongoose.connection.close();
};

generateReviews();
