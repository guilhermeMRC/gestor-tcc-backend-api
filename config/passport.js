const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    
    const User = app.model.UserSchema.User
    const secret = process.env.AUTH_SECRET

    // User.findById('5f6cff9d1fd62335b061fd24').exec().then(use => console.log(use))

    const params = {
        secretOrKey: secret, 
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const strategy = new Strategy(params, (payload, done) => {
        
        User.findOne({_id: payload.id})
            .exec()
            .then(user => done(null, user ? user : false))
            .catch(err => done(err, false))        
    })
    
    passport.use(strategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}