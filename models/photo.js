const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  imageUrl: {
    type: String, // URL or path to the uploaded photo
    required: true
  },
  caption: {
    type: String, // Optional caption for the photo
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Photo = mongoose.model('Photo', photoSchema);
module.exports = Photo;
