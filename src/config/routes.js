const { get } = require("mongoose")
const isCoordinator = require('./isCoordinator')
const multer = require('multer')
const multerConfig = require('./multer')
const aws = require('aws-sdk')
const { Mongoose } = require("mongoose")
const { mongo } = require("mongoose")
const moment = require('moment')

const s3 = new aws.S3()
module.exports = app => {
    const User = app.src.model.UserSchema.User

    const routerDefault = async (req, res) => {
        res.status(200).send("Serviço funcionando")
    }

    //rota raiz
    app.get('/', routerDefault)

    //rota de login no sistema
    app.post('/login', app.src.controler.auth.signin)
    // app.post('/validateToken', app.src.controler.auth.validateToken)

    //rota esqueci minha senha
    app.post('/esqueci_minha_senha', app.src.controler.user.forgotPassword)

    //rota para resetar senha
    app.post('/resetar_senha', app.src.controler.user.resetPassword)
    
    //===============Rotas de Cadastros de Usuários==================//
    
    //rota para cadastrar professor
    app.route('/usuarios/cadastrar_professor')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))
        // .get(isCoordinator(app.src.controler.user.listAllUsers))
    
    //rota para cadastrar Aluno
    app.route('/usuarios/cadastrar_aluno')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))
        // .get(isCoordinator(app.src.controler.user.listAllUsers))

    //rota para cadastrar Administrativo
    app.route('/usuarios/cadastrar_administrativo')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))

    //==============rotas para Listar==================//
    
    //Listar todos os usuários por tipo de usuário [Professor, Aluno ou Administrativo]
    app.route('/usuarios/todos_usuarios/:userType/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.listAllUsersForTypeUser))

    //Listar todos os usuários por tipo e pelo seu status    
    app.route('/usuarios/todos_usuarios/:userType/:status/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.listAllUsersForTypeUserAndStatus))

    app.route('/usuarios/listar_usuarios/:nome_ou_matricula/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.getUserByRegistrationOrName))
    
    //==============rotas para Atualizar usuário==================// 
    app.route('/usuarios/todos_usuarios/atualizar_aluno')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))

    app.route('/usuarios/todos_usuarios/atualizar_professor')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))
    
    app.route('/usuarios/todos_usuarios/atualizar_administrativo')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))

    app.route('/usuarios/atualizar_perfil/aluno')
        .patch(multer(multerConfig).single('file'), async(req, res) => {
            const {originalname: namePicture, size, key, location: url = "" } = req.file 
            const user = await User.findOne({ _id: req.body.id })
            // console.log(user.profilePicture.key)
            
            const count = Object.entries(user.profilePicture).length 
            if(count !== 0) {
                s3.deleteObject({
                    Bucket: 'gestor-uploads/upload_images',
                    Key: user.profilePicture.key   
                }).promise()
                
            }

            const codPicture = key.split("-")
            const picture = {
                cod: codPicture[0],
                namePicture,
                size,
                key,
                url,
                createdAt: moment().format()
            }

            user.profilePicture = picture
            await user.save()

            return(res.json(user))
        })
        .get(async (req, res) => {
            //basta criar uma query para trazer só informações de perfil
            const user = await User.find()
            res.json(user)
        })
        
    
}