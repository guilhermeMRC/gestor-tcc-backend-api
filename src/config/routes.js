const { get } = require("mongoose")
const isCoordenador = require('./isCoordenador')
module.exports = app => {
    
    const routerDefault = async (req, res) => {
        res.status(200).send("Ok")
    }

    app.get('/', routerDefault)

    app.post('/login', app.src.controler.auth.signin)
    // app.post('/validateToken', app.controler.auth.validateToken)
        
    app.route('/users')
        .all(app.src.config.passport.authenticate())
        .post(isCoordenador(app.src.controler.user.saveUser))
        .get(isCoordenador(app.src.controler.user.listAllUsers))

    app.route('/users/forgot_password')
        .post(app.src.controler.user.forgotPassword)
        
    app.route('/users/mat/:matricula')
        .all(app.src.config.passport.authenticate())
        .get(app.src.controler.user.getUserByRegistration)
    
    app.route('/users/:id')
        .all(app.src.config.passport.authenticate())
        .get(app.src.controler.user.getUserById)
        .patch(isCoordenador(app.src.controler.user.updateUser))

    
}