const { get } = require("mongoose")

module.exports = app => {
    
    app.post('/login', app.controler.auth.signin)
    // app.post('/validateToken', app.controler.auth.validateToken)
        
    app.route('/users')
        .all(app.config.passport.authenticate())
        .post(app.controler.user.saveUser)
        .get(app.controler.user.listAllUsers)

    app.route('/users/mat/:matricula')
        .all(app.config.passport.authenticate())
        .get(app.controler.user.getUserByRegistration)
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .get(app.controler.user.getUserById)
        .patch(app.controler.user.updateUser)
}