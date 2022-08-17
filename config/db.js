const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(
    chalk.yellow.underline(`MongoDB connected: ${conn.connection.host}`)
  );
};

module.exports = connectDB;
