const mongoose = require('mongoose');

// pass the database name in the end of the url if you want to conneted to specific database
const url = 'mongodb+srv://adnaniqbal:Q3drwSVU1KELCrfZ@cluster0.f0ecoxs.mongodb.net/crud'

async function connectDB() {
  await mongoose.connect(url);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}





module.exports = {
    connectDB
}