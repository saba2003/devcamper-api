const fs = require('fs')
const mongoose = require('mongoose')
const chalk = require('chalk')
const dotenv = require('dotenv')

// Load env variables
dotenv.config({ path: './config/config.env' })

// Load Models
const Bootcamp = require('./models/Bootcamp')

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/jsons/bootcamps.json`, 'utf-8')
)

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps)

        console.log(chalk.green.inverse('Data Imported...'));
        process.exit()
    } catch (error) {
        console.log(error);
    }
}

// Delete Data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()

        console.log(chalk.red.inverse('Data Destroyed...'));
        process.exit()
    } catch (error) {
        console.log(error);
    }
}

// In terminal: node seeder -i / node seeder -d
if(process.argv[2] === '-i') {
    importData()
}else if(process.argv[2] === '-d') {
    deleteData()
}