const express = require('express')
const consign = require('consign')
const mongoose = require('mongoose')

require('dotenv').config()
require('./config/gestor-tcc-db')

const app = express()

/*Remover da resposta HTTP (header: x-powered-by) 
a referência de que o Express/Node compõem a lista 
de tecnologias utilizadas, isso irá afastar rotinas 
mais simples de varredura e ataques automatizados;*/
app.disable('x-powered-by')

//chamando o mongodb
app.mongoose = mongoose

//autoload nas pastas 
consign()
    .include('./src/config/middlewares.js')
    .then('./src/resources')
    .then('./src/controler/nodemailer.js')
    .then('./src/controler/validation.js')
    .then('./src/model')
    .then('./src/controler/user.js')
    .then('./src/controler/auth.js')
    .then('./src/config/passport.js')
    .then('./src/config/routes.js')
    .into(app)
    
app.listen(process.env.PORT || 3000, () => {
    console.log('Server running!')
})