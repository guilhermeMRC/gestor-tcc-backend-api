module.exports = app => {
    
    app.post('/login', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)
        
    app.route('/users')
        .post(app.api.user.saveUser)
        .get(app.api.user.listAllUsers)

}