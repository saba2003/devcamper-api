const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const chalk = require('chalk')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to database
connectDB()

// Route files
const bootcamps = require('./routes/bootcamps')

const application = express()

// Body parser
application.use(express.json())

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    application.use(morgan('dev'))
}

// Mount routers
application.use('/api/v1/bootcamps', bootcamps)

// Middleware
application.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = application.listen(
    PORT, 
    console.log(chalk.bold.cyan(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))
)

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(chalk.red.underline(`Error: ${err.message}`));
    // Close server & exit process
    server.close(() => process.exit(1))
})