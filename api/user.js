const bcrypt = require('bcrypt')
const { json } = require('express')
const { use } = require('passport')

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
        
        //confirmação de senha que não será salvo no banco
        const confirmPassword = req.body.confirmPassword
        
        try {
            existOrError(req.body.name, 'Nome não informado')
            existOrError(req.body.matricula, 'Matricula não informada')
            existOrError(req.body.password, 'Senha não informada')
            existOrError(confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(req.body.password, confirmPassword, 'Senhas não conferem')

            const userFromDB = await User.findOne({matricula: req.body.matricula}).exec()
            
            // res.json(userFromDB)
            
            if(userFromDB) {
                return res.status(400).send("Já possui um usuário cadastrado com essa matricula")
            }
            
            //pegando dados de um novo usuário
            const user = new User ({
                name: req.body.name,
                matricula: req.body.matricula,
                password: req.body.password,
            })

            user.password = encryptPassword(user.password)
        
            const newUser = await user.save()
            res.status(201).json(newUser)
            
        }catch (msg) {
            return res.status(400).send(msg)
        }
        
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

    const getUserByMatricula = async (req, res) => {
       
        try {
            
            const user = await User.findOne({ matricula: req.params.matricula }).exec() 
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }else {
                return res.status(200).json(user)
            }

        }catch(error) {
            return res.status(500).json({message: error.message})
        }
        
    }

    const getUserById = async (req, res) => {
       
        try {
            
            const user = await User.findById(req.params.id)
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }else {
                // return res.status(200).json(user)
                return user
            }

        }catch(error) {
            return res.status(500).json({message: error.message})
        }
        
    }

    const updateUser = async (req, res) => {
        try { 
            
            const user = await User.findById(req.params.id)
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }

            existOrError(req.body.name, 'Nome não informado')
            user.name = req.body.name
            existOrError(req.body.matricula, 'Matricula não informada')
            user.matricula = req.body.matricula

            try {
                    const userUpdate = await user.save() 
                    res.json(userUpdate)   
            } catch (msg) {
                    res.status(400).send(msg)
            }

        }catch(msg) {
            return res.status(500).send(msg)
        }
 
    }

    return { User, saveUser, listAllUsers, getUserByMatricula, getUserById, updateUser }
}