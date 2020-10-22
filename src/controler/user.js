const { json } = require('express')
const { use } = require('passport')
const crypto = require('crypto');
const mongoosePaginate = require('mongoose-paginate-v2');

module.exports = app => {
    //função para encriptar senha
    const { encryptPassword } = app.src.config.bcrypt
    
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError, isNumeric } = app.src.controler.validation

    //Importando o model
    const User = app.src.model.UserSchema.User
    
    //inportando o transporte para envio de email
    const transporter = app.src.controler.nodemailer.transporter

    //importando template do e-mail formatado
    const { formatEmail } = app.src.resources.template_email

    //Salvar usuário
    const saveUser = async (req, res) => {
        const confirmPassword = req.body.confirmPassword
        try {
            existOrError(req.body.name, 'Nome não informado')
            existOrError(req.body.registration, 'Matricula não informada')
            existOrError(req.body.password, 'Senha não informada')
            existOrError(req.body.email, 'E-mail não informado')
            existOrError(confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(req.body.password, confirmPassword, 'Senhas não conferem')

            const userFromDb = await User.findOne({registration: req.body.registration}).exec()
            if(userFromDb) {
                return res.status(404).send("Já possui um usuário cadastrado com essa matricula")
            }

            const userFromDb2 = await User.findOne({email: req.body.email}).exec()
            if(userFromDb2) {
                return res.status(404).send("Já possui um usuário cadastrado com esse e-mail")
            }
            
            //pegando dados de um novo usuário
            const user = new User({
                ...req.body
            })

            user.password = encryptPassword(user.password)
        
            const newUser = await user.save() 
            res.status(201).json({user: newUser, resposta: "Usuário Cadastrado com sucesso"})
            
        }catch (msg) {
            return res.status(400).send(msg)
        }
        
    }

    const listAllUsersForTypeUser = async (req, res) => {
        try {
            const query = User.find({userType : req.params.userType})
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

    //filtrar usuário pela matrícula ou nome
    const getUserByRegistrationOrName = async (req, res) => {
       
        try {
            
            const nameOrRegistration = req.params.nome_ou_matricula
            const query = User.find({ $or: [
                    {registration: nameOrRegistration},
                    {name: new RegExp(nameOrRegistration, "i")}
                ]
            }).select(
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

    const updateUser = async (req, res) => {
        try { 
            
            const userTypes = ['professor', 'aluno', 'administrativo']
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

            if(req.params.userType === 'Professor') {
                user.isCoordenator = req.body.isCoordenator
            }else {
                user.isCoordenator = false
            }
            
            await user.save()

            res.status(200).json({user, sucesso: "Usuário editado com sucesso"})

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
            getUserByRegistrationOrName, 
            updateUser, 
            forgotPassword,
            resetPassword      
        }
}