const { get } = require("mongoose")
const isCoordenador = require('./isCoordenador')
module.exports = app => {
    
    app.post('/login', app.controler.auth.signin)
    // app.post('/validateToken', app.controler.auth.validateToken)
        
    app.route('/users')
        .all(app.config.passport.authenticate())
        .post(isCoordenador(app.controler.user.saveUser))
        .get(isCoordenador(app.controler.user.listAllUsers))

    app.route('/users/mat/:matricula')
        .all(app.config.passport.authenticate())
        .get(app.controler.user.getUserByRegistration)
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .get(app.controler.user.getUserById)
        .patch(isCoordenador(app.controler.user.updateUser))
}