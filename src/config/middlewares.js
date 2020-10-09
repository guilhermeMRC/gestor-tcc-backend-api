const cors = require('cors')
const express = require('express')
const compression = require('compression')

module.exports = app => {
    app.use(cors())
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
}
