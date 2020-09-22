module.exports = app => {
    
    app.route('/users')
        .post(app.api.user.saveUser)
        .get(app.api.user.listAllUsers)

    // app.route('/users')
    //     .get(app.api.user.listAllUsers)
}