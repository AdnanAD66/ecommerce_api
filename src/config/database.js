const mongoose = require('mongoose');
require('dotenv').config();


// pass the database name in the end of the url if you want to conneted to specific database
const url = `mongodb+srv://${process.env.user_name}:${process.env.password}@cluster0.f0ecoxs.mongodb.net/${process.env.DB_NAME}`

async function connectDB() {
  await mongoose.connect(url);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}





module.exports = {
    connectDB
}