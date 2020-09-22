const bcrypt = require('bcrypt')

module.exports = app => {
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError } = app.api.validation

    //implementando o model
    const User = app.mongoose.model('User', {
        name: String,
        matricula: String,
        password: String
    })

    //função que encripta a senha
    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    //função que Salva no banco 
    const saveUser = async (req, res) => {
        const user = new User ({
            name: req.body.name,
            matricula: req.body.matricula,
            password: req.body.password
        })
        
        //se vier nos parametros é porque eu to querendo alterar
        if(req.params.id) user.id = req.params.id

        try {
            /*Validações*/ 
            

        }catch (error) {
            res.status(400).json({ message: error.message })
        }
        
        user.password = encryptPassword(user.password)
        const newUser = await user.save()
        res.status(201).json(newUser)
        
    }

    //Listar todos os usuários
    const listAllUsers = async (req, res) => {
        try {
            const users = await User.find()
            res.json(users)
        }catch(error) {
            res.status(500).json({ message: error.message })
        }
    }

    return { User, saveUser, listAllUsers }
}