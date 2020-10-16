const bcrypt = require('bcrypt')

module.exports = app => {

    function comparePassword(res, passwordA, passwordB) {
        const isMatch = bcrypt.compareSync(passwordA, passwordB)
        if(!isMatch){
            return res.status(401).send('Senha inválidos')
        }
    }
    
    function encryptPassword(password) {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    return { comparePassword, encryptPassword }
}