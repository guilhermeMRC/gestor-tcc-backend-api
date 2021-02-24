const bcrypt = require('bcrypt')

module.exports = app => {

    function comparePassword(passwordA, passwordB) {
        const isMatch = bcrypt.compareSync(passwordA, passwordB)
        return isMatch
    }
    
    function encryptPassword(password) {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    return { comparePassword, encryptPassword }
}