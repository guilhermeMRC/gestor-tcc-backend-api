const { json } = require('express')
const { use } = require('passport')
const crypto = require('crypto');
const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment')
const aws = require('aws-sdk')

const s3 = new aws.S3()

module.exports = app => {
    //função para encriptar senha
    const { encryptPassword } = app.src.config.bcrypt
    
    //funções de validação
    const { 
            existOrError, 
            notExistsOrError, 
            equalsOrError, 
            isNumeric, 
            deleteS3  
        } = app.src.controler.validation

    //Importando o model
    const User = app.src.model.UserSchema.User
    
    //inportando o transporte para envio de email
    const transporter = app.src.controler.nodemailer.transporter

    //importando template do e-mail formatado
    const { formatEmail, formatEmailSaveUser } = app.src.resources.template_email

    const {saveMenssage} = app.src.config.posts.userMenssage

    //Salvar usuário
    const saveUser = async (req, res) => {
        try {
            const {name, registration, email, userType } = req.body
            existOrError(name, saveMenssage.nameNotInformed)
            existOrError(registration, saveMenssage.registrationNotInformed)
            existOrError(email, saveMenssage.emailNotInformed)
            existOrError(userType, saveMenssage.userTypeNotInformed)

            const userFromDb = await User.findOne({registration: req.body.registration}).exec()
            notExistsOrError(userFromDb, saveMenssage.foundSameRegistration)

            const userFromDb2 = await User.findOne({email: req.body.email}).exec()
            notExistsOrError(userFromDb2, saveMenssage.foundSameEmail)

            //pegando dados de um novo usuário
            const user = new User({
                ...req.body
            })

            switch(user.userType) {
                case 'professor': 
                    user.available = 'sim'
                    break
                case 'aluno':
                    user.available = 'sim'
                    break
                default:
                    user.available = 'nulo'
                    break
            }   
            const randomPassword = crypto.randomBytes(4).toString("hex");
            user.password = encryptPassword(randomPassword)
            
            const defaultAdminEmail = process.env.SMTP_USER
            const constructEmail = formatEmailSaveUser(user.registration, randomPassword)
            const mailSent = await transporter.sendMail({
                from: defaultAdminEmail,
                to: user.email,
                subject: "Cadastro no SGTCC curso de Sistema de Informação",
                html: constructEmail
            })
            existOrError(mailSent, saveMenssage.mailSent)

            const newUser = await user.save()
            res.status(201).json({user: newUser, mailSent, resposta: saveMenssage.registeredSuccessfully})
        }catch (msg) {
            console.log(msg)
            switch(msg) {
                case saveMenssage.nameNotInformed:
                    res.status(400).send(msg)
                    break
                case saveMenssage.registrationNotInformed:
                    res.status(400).send(msg)
                    break
                case saveMenssage.emailNotInformed:
                    res.status(400).send(msg)
                    break
                case saveMenssage.userTypeNotInformed: 
                    res.status(400).send(msg)
                    break
                case saveMenssage.foundSameRegistration:
                    res.status(403).send(msg)
                    break
                case saveMenssage.foundSameEmail:
                    res.status(403).send(msg)
                    break
                case saveMenssage.mailSent:
                    res.status(500).send(msg)
                    break 
                default: 
                    res.status(500).send(saveMenssage.serverError)
                    break   
            }   
        
        }
    }

    const listAllUsersForTypeUser = async (req, res) => {
        try {
            const query = User.find({userType : req.params.userType})
                .sort({name:'asc'})
                .select(
                    "name registration email status userType isCoordinator createdAt"
                );

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, "Nenhum usuário encontrado")
            res.status(200).json(users)

        }catch(error) {
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }   
    }

    const listAllUsersForTypeUserAndStatus = async (req, res) => {
        try {
            const query = User.find({userType : req.params.userType})
                .where('status')
                .equals(req.params.status)
                .sort({name:'asc'})
                .select(
                    "name registration email status userType isCoordinator createdAt"
                );

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, "Nenhum usuário encontrado")
            res.status(200).json(users)

        }catch(error) {
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }   
    }
    
    //filtrar todos os alunos ativos que estão sem projeto
    const listAllStudentsNotProject = async (req, res) => {
        try {
            const query = User.find({userType : 'aluno'})
                .and([{status:'ativo'}, {project: []}])
                .sort({name:'asc'}) 
                .select(
                    "_id name registration email status userType project isCoordinator available createdAt"
                );

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, "Nenhum usuário encontrado")
            res.status(200).json(users)

        }catch(error) {
            console.log(error)
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }
    }

    //Listando o perfil dos professores 
    const listAllProfileTeacher = async (req, res) => {
        try {
            const page = req.params.page
            const parameters = [ 
                'name', 'registration','email',
                'status', 'isCoordinator', 'profilePicture',
                'aboutProfile', 'available', 'links',
                'phoneNumber', 'secundaryEmail'
            ]
            const query = User.find({ userType: 'professor'})
            .sort({name:'asc'}) 
            .select(
                parameters
            );

            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, 'Nenhum usuário encontrado')

            res.status(200).json(users)

        }catch(error) {
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }    
        }     
    }

    //filtrar todos os usuários por matrícula ou nome 
    const getAllByRegistrationOrName = async (req, res) => {
        try {
            const nameOrRegistration = req.params.nome_ou_matricula
            const query = User.find({ $or: [
                    {registration: nameOrRegistration},
                    {name: new RegExp(nameOrRegistration, "i")}
                ]
            }).where('userType')
            .equals(req.params.userType)
            .select(
                "name registration email status userType isCoordinator createdAt"
            );

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, 'Nenhum usuário encontrado')

            res.status(200).json(users)

        }catch(error) {
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }    
        }
        
    }


    //filtrar usuário pela matrícula ou nome de acordo com status
    const getUserByRegistrationOrName = async (req, res) => {
       
        try {
            
            const nameOrRegistration = req.params.nome_ou_matricula
            const query = User.find({ $or: [
                    {registration: nameOrRegistration},
                    {name: new RegExp(nameOrRegistration, "i")}
                ]
            }).and([{ userType: req.params.userType }, { status: req.params.status }])
            .select(
                "name registration email status userType isCoordinator createdAt"
            );

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const users = await User.paginate(query, options)
            existOrError(users.docs, 'Nenhum usuário encontrado')

            res.status(200).json(users)

        }catch(error) {
            if(error === "Nenhum usuário encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }    
        }
        
    }

    const getProfileUserInfo = async (req, res) => {
        try {
            const parameters = [
                '_id', 'name', 'email','registration', 'profilePicture', 
                'secundaryEmail', 'aboutProfile', 'available', 
                'links', 'phoneNumber'
            ]
            const user = await User.findOne({_id: req.params.id})
                .select(parameters)
            existOrError(user, 'Usuário não encontrado')
            res.status(200).json(user)
        } catch (msg) { 
            res.status(400).json(msg)
        }
    }

    const updateUser = async (req, res) => {
        try { 
            
            const user = await User.findOne({ _id: req.body.id })
                .select("name registration email status userType isCoordinator createdAt");
                
            existOrError(user, "Nenhum usuário encontrado")

            existOrError(req.body.name, 'Nome não informado')
            existOrError(req.body.registration, 'Matricula não informada')
            existOrError(req.body.email, 'E-mail não informado')
            existOrError(req.body.userType, 'Tipo de usuário não informado')

            user.name = req.body.name
            user.registration = req.body.registration
            user.email = req.body.email
            user.status = req.body.status
            user.userType = req.body.userType

            if(req.body.userType === 'professor') {
                user.isCoordinator = req.body.isCoordinator
            }else {
                user.isCoordinator = false
            }
            
            await user.save()

            res.status(200).json({user, mensagem: "Usuário editado com sucesso"})

        }catch(msg) {
            switch(msg) {
                case 'Nenhum usuário encontrado': 
                    res.status(400).send('Nenhum usuário encontrado')
                    break
                case 'Nome não informado':
                    res.status(400).send('Nome não informado')
                    break
                case 'Matricula não informada':
                    res.status(400).send('Matricula não informada')
                    break
                case 'E-mail não informado':
                    res.status(400).send('E-mail não informado')
                    break
                case 'Tipo de usuário não informado': 
                    res.status(400).send('Tipo de usuário não informado')
                    break
                default: 
                    res.status(500).send('Erro interno')   
            }   
        }
    }

    const updateUserStatus = async (req, res) => {
        try {
            existOrError(req.body.id, 'id não informado')
            const user = await User.findOne({ _id: req.body.id })
            
            if(user.status === 'ativo') {
                user.status = 'inativo'
                await user.save()    
            }else {
                user.status = 'ativo'
                await user.save()    
            }
            
            res.status(200).json({ user, mensagem: 'Status alterado com sucesso'})
        }catch(msg) {
            switch(typeof msg) {
                case 'string':
                    res.status(400).json({mensagem: msg})
                    break
                case 'object':
                    res.status(400).json({mensagem: 'Id incorreto'})
                    break
                default: 
                    res.status(500).json({mensagem: 'Falha interna'}) 
            }
        }
    }

    const updateProfileUser = async (req, res) => {
        try{
            const user = req.user
            const {
                facebook, linkedin, youtube, instagram,
                lattes, primaryNumber, secondNumber, available,
                secundaryEmail, aboutProfile
            } = req.body
            const findUser = await User.findOne({ _id: req.params.id })
            existOrError(findUser, 'Id do usuário incorreto ou não encontrado')
            equalsOrError(`${user._id}`, `${findUser._id}`, 'Usuário não tem permissão para alterar esse perfil')
            
            const newLinks = {
                facebook: facebook,
                linkedin: linkedin,
                youtube: youtube,
                instagram: instagram,
                lattes: lattes,
            }
            const newPhoneNumber = {
                primaryNumber: primaryNumber,
                secondNumber: secondNumber
            }

            //aqui garante que sempre o aluno, se tiver projeto sempre vai receber um 
            //available não
            if(findUser.userType === 'aluno' && findUser.project.length > 0){
                findUser.available = 'não'    
            }else{
                findUser.available = available
            }

            findUser.secundaryEmail = secundaryEmail
            findUser.aboutProfile = aboutProfile
            findUser.links = newLinks
            findUser.phoneNumber = newPhoneNumber
            
            await findUser.save()
            res.status(200).json({findUser, message: 'Perfil atualizado com sucesso'})
        }catch(msg) {
            return res.status(400).json({message: msg})
        }
    } 

    //Rota usada para editar apenas foto do perfil do usuário
    const updateUserProfilePicture = async (req, res) => {
        try {
            const user = req.user
            const findUser = await User.findOne({_id: req.params.id})
            if(!findUser) {
                deleteS3(req, process.env.AWS_STORAGE_IMAGE)
                return res.status(400).json('Id do usuário incorreto ou não encontrado')
            }

            if(`${user._id}` !== `${findUser._id}`) {
                deleteS3(req, process.env.AWS_STORAGE_IMAGE)
                return res.status(400).json('Usuário não tem permissão para alterar esse perfil')    
            }

            if(req.file) {
                const {originalname: namePicture, size, key, location: url = "" } = req.file 
                // //checa se o objeto está vazio se ele estiver vazio
                // //ele vai até o buket e apaga a foto antiga antes de salvar a nova
                if(findUser.profilePicture.key !== '') {
                    s3.deleteObject({
                        Bucket: process.env.AWS_STORAGE_IMAGE,
                        Key: findUser.profilePicture.key   
                    }).promise()
                }
                
                const codPicture = key.split("-")
                const picture = {
                    cod: codPicture[0],
                    namePicture,
                    size,
                    key,
                    url,
                }
                findUser.profilePicture = picture
            }

            await findUser.save()
            res.status(200).json({findUser, Mensage: 'Foto de perfil adicionada com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    //usuário esqueceu a senha
    const forgotPassword = async (req, res) => { 
        try {
            existOrError(req.body.email,"e-mail, não informado")
            const user = await User.findOne({email: req.body.email}).exec()
            existOrError(user,"E-mail não cadastrado")

            equalsOrError(user.status, 'ativo', "Não é possivel recuperar senha. Usuário está inativo. Por favor, entre em contato com a coordenação.")
            
            const defaultAdminEmail = process.env.SMTP_USER
            
            const token = crypto.randomBytes(20).toString("hex");
            
            const constructEmail = formatEmail(token)
            
            const mailSent = await transporter.sendMail({
                from: defaultAdminEmail,
                to: user.email,
                subject: "Recuperação de Senha Gestor TCC IFF",
                html: constructEmail
            })

            const now = new Date();
            now.setHours(now.getHours() + 1);

            //salvar no banco o token
            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now,
                },
            });

            res.status(200).json(mailSent)
            
        }catch(msg) {
            return res.status(400).send(msg)
        }
    }

    //atualizar senha
    const resetPassword = async (req, res) => { 
        
        try {
            existOrError(req.body.token, 'token não informado')
            existOrError(req.body.password, 'nova senha não informada')
            existOrError(req.body.confirmPassword, 'confirmação de senha não informada')
            
            equalsOrError(req.body.password, req.body.confirmPassword, 'Senhas não conferem')

            const user = await User.findOne({ passwordResetToken: req.body.token }).select(
                "+passwordResetToken password passwordResetExpires"
            );

            existOrError(user, 'Token inválido')
            equalsOrError(req.body.token, user.passwordResetToken, 'Token inválido')

            const now = new Date();
            if (now > user.passwordResetExpires)
            return res.status(400).send("Token expirou, gere um novo token na tela de esqueci minha senha");

            user.password = encryptPassword(req.body.password)

            await user.save()
            res.status(200).json({user, resposta: 'Senha alterada com sucesso!'})
            
            //caso precise redirecionar aqui   
            // res.status(301).redirect('https://gestor-tcc-frontend-react.vercel.app/login')

        } catch (msg) {
            return res.status(400).send(msg)
        }
    }

    return {
        saveUser, 
        listAllUsersForTypeUser,
        listAllUsersForTypeUserAndStatus,
        listAllStudentsNotProject,
        listAllProfileTeacher,
        getAllByRegistrationOrName,  
        getUserByRegistrationOrName,
        getProfileUserInfo, 
        updateUser,
        updateUserStatus,
        updateProfileUser,
        updateUserProfilePicture, 
        forgotPassword,
        resetPassword      
    }
}