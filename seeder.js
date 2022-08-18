const fs = require('fs');
const mongoose = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Load Models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/jsons/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/jsons/courses.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/jsons/users.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);

    console.log(chalk.green.inverse('Data Imported...'));
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    console.log(chalk.red.inverse('Data Destroyed...'));
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// In terminal: node seeder -i / node seeder -d
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
