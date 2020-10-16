const { get } = require("mongoose")
const isCoordinator = require('./isCoordinator')
module.exports = app => {
    
    const routerDefault = async (req, res) => {
        res.status(200).send("Ok")
    }

    app.get('/', routerDefault)

    app.post('/login', app.src.controler.auth.signin)
    app.post('/validateToken', app.src.controler.auth.validateToken)

    app.post('/reset_password', app.src.controler.user.resetPassword)
        
    app.route('/users')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))
        .get(isCoordinator(app.src.controler.user.listAllUsers))

    app.route('/users/forgot_password')
        .post(app.src.controler.user.forgotPassword)
        
    app.route('/users/mat/:matricula')
        .all(app.src.config.passport.authenticate())
        .get(app.src.controler.user.getUserByRegistration)
    
    app.route('/users/:id')
        .all(app.src.config.passport.authenticate())
        .get(app.src.controler.user.getUserById)
        .patch(isCoordinator(app.src.controler.user.updateUser))

    
}