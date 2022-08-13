const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')

// Route files
const bootcamps = require('./routes/bootcamps')

// Load env vars
dotenv.config({ path: './config/config.env' })

const application = express()

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    application.use(morgan('dev'))
}


// Mount routers
application.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 5000

application.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))