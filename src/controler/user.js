const bcrypt = require('bcrypt')
const { json } = require('express')
const { use } = require('passport')


module.exports = app => {
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError } = app.src.controler.validation

    //Importando o model
    const User = app.src.model.UserSchema.User
    
    //inportando o transporte para envio de email
    const transporter = app.src.controler.nodemailer.transporter

    //função que encripta a senha
    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    // const encryptIdUser = idUser => {

    // }

    const saveUser = async (req, res) => {
        //confirmação de senha que não será salvo no banco
        const confirmPassword = req.body.confirmPassword
        
        try {
            existOrError(req.body.name, 'Nome não informado')
            existOrError(req.body.registration, 'Matricula não informada')
            existOrError(req.body.password, 'Senha não informada')
            existOrError(confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(req.body.password, confirmPassword, 'Senhas não conferem')

            const userFromDB = await User.findOne({registration: req.body.registration}).exec()
            
            if(userFromDB) {
                return res.status(404).send("Já possui um usuário cadastrado com essa matricula")
            }
            
            //pegando dados de um novo usuário
            const user = new User({
                ...req.body
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

    //filtrar usuário pela matrícula
    const getUserByRegistration = async (req, res) => {
       
        try {
            
            const user = await User.findOne({ registration: req.params.registration }).exec() 
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }else {
                return res.status(200).json(user)
            }

        }catch(error) {
            return res.status(500).json({message: error.message})
        }
        
    }

    //filtrar usuario pelo id
    const getUserById = async (req, res) => {
       
        try {
            
            const user = await User.findById(req.params.id)
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }else {
                return res.status(200).json(user)
            }

        }catch(error) {
            return res.status(500).json({message: error.message})
        }
        
    }

    //atualizar usuário no banco
    //mexer nele depois
    const updateUser = async (req, res) => {
        try { 
            
            const user = await User.findById(req.params.id)
            
            if(user == null) {
                return res.status(404).send("Usuário não encontrado")
            }

            existOrError(req.body.name, 'Nome não informado')
            user.name = req.body.name
            existOrError(req.body.registration, 'Matricula não informada')
            user.registration = req.body.registration

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

    //usuário esqueceu a senha
    const forgotPassword = async (req, res) => { 
        try {
            existOrError(req.body.email,"e-mail, não informado")
            const user = await User.findOne({email: req.body.email}).exec()
            existOrError(user,"E-mail não cadastrado")
            
            const defaultAdminEmail = "Guilherme Muniz <gestortcciff@gmail.com"
            const mailSent = await transporter.sendMail({
                from: defaultAdminEmail,
                to: user.email,
                subject: "Recuperação de Senha Gestor TCC IFF",
                text: "Teste"
            })

            res.status(200).json(mailSent)
            
        
            // console.log(mailSent)
            
            // res.status(200).json(user)
            
        }catch(msg) {
            return res.status(400).send(msg)
        }
    }

    return {
        saveUser, 
        listAllUsers, 
        getUserByRegistration, 
        getUserById, 
        updateUser, 
        forgotPassword 
    }
}