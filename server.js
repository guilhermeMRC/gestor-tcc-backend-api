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
    .include('./config/middlewares.js')
    .then('./controler/validation.js')
    .then('./model')
    .then('./controler/user.js')
    .then('./controler/auth.js')
    .then('./config/passport.js')
    .then('./config/routes.js')
    .into(app)
    
app.listen(process.env.APP_PORT || 3000, () => {
    console.log('Server running!')
})