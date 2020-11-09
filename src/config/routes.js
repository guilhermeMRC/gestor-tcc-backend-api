const { get } = require("mongoose")
const isCoordinator = require('./isCoordinator')
const multer = require('multer')
// const multerConfig = require('./multer')
const { Mongoose } = require("mongoose")


module.exports = app => {
    // const User = app.src.model.UserSchema.User
    // const Documentation = app.src.model.DocumentationSchema.Documentation
    // const Project = app.src.model.ProjectSchema.Project

    const multerConfigImages = app.src.config.multer.uploadImages
    const multerConfigDocuments = app.src.config.multer.uploadDocumentation

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
        
    //rota para cadastrar Aluno
    app.route('/usuarios/cadastrar_aluno')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))

    //rota para cadastrar Administrativo
    app.route('/usuarios/cadastrar_administrativo')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(app.src.controler.user.saveUser))

    //==============rotas para Listar usuário==================//
    
    //Listar todos os usuários por tipo de usuário [Professor, Aluno ou Administrativo]
    app.route('/usuarios/todos_usuarios/:userType/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.listAllUsersForTypeUser))

    //Listar todos os usuários por tipo e pelo seu status    
    app.route('/usuarios/todos_usuarios/:userType/:status/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.listAllUsersForTypeUserAndStatus))

    //Listar todos os usuários por tipo e por matrícula ou nome
    app.route('/usuarios/listar_usuarios/:userType/:nome_ou_matricula/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(app.src.controler.user.getUserByRegistrationOrName))

    //Listar todos os alunos ativos sem projetos    
    app.route('/usuarios/listar_usuarios/aluno_sem_projeto/:page')
        .get(app.src.controler.user.listAllStudentsNotProject)
    
    //==============rotas para Atualizar usuário==================// 
    //Atualiza informações sensíveis de alunos
    app.route('/usuarios/todos_usuarios/atualizar_aluno')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))
    
    //Atualiza informações sensíveis de professor
    app.route('/usuarios/todos_usuarios/atualizar_professor')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))
    
    //Atualiza informações sensíveis de administrativo    
    app.route('/usuarios/todos_usuarios/atualizar_administrativo')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(app.src.controler.user.updateUser))

    //Atualiza informações de perfil dos usuários    
    app.route('/usuarios/atualizar_perfil')
        .all(app.src.config.passport.authenticate())
        .patch(multer(multerConfigImages).single('file'), app.src.controler.user.updateProfileUser)
    
    //Atualiza apenas o status do usuário
    app.route('/usuarios/atualizar_status')
        .all(app.src.config.passport.authenticate())
        .put(isCoordinator(app.src.controler.user.updateUserStatus))
    
    //===============Cadastro de Documentos relativos ao Curso==============================
    app.route('/documentos/cadastrar_documento')
        .all(app.src.config.passport.authenticate())
        .post(multer(multerConfigDocuments).single('file'),app.src.controler.documentation.saveDocuments)
    
    //================Listando Documentos Relativos ao TCC===================================
    app.route('/documentos/listar_todos_documentos/:page')
        .all(app.src.config.passport.authenticate())
        .get(app.src.controler.documentation.listAllDocumentation)

    //================Cadastrando Projeto=================================================
    app.route('/projeto/cadastrar_projeto')
        .post(app.src.controler.project.saveProject)
    
    //================Listando Todos os Projetos==========================================    
    app.route('/projeto/listar_todos')
        .get(app.src.controler.project.listaAllProjects)

    //================Cadastrando Tarefas do Projeto=======================================
    app.route('/tarefas/cadastrar_tarefas')
        .post(app.src.controler.task.saveTask)
}