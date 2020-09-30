const { get } = require("mongoose")

module.exports = app => {
    
    app.post('/login', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)
        
    app.route('/users')
        .all(app.config.passport.authenticate())
        .post(app.api.user.saveUser)
        .get(app.api.user.listAllUsers)

    app.route('/users/mat/:matricula')
        .all(app.config.passport.authenticate())
        .get(app.api.user.getUserByMatricula)
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.user.getUserById)
        .patch(app.api.user.updateUser)
}