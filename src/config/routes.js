const { get } = require("mongoose")
const isCoordinator = require('./isCoordinator')
const multer = require('multer')
// const multerConfig = require('./multer')
const { Mongoose } = require("mongoose")


module.exports = app => {
    // const User = app.src.model.UserSchema.User
    // const Documentation = app.src.model.DocumentationSchema.Documentation
    // const Project = app.src.model.ProjectSchema.Project
    
    const { 
            uploadImages: multerConfigImages, 
            uploadDocumentation: multerConfigDocuments, 
            uploadTaskDocumentation: multerconfigTaskDocuments 
    } = app.src.config.multer

    const { signin } = app.src.controler.auth
    const { saveDocuments, listAllDocumentation } = app.src.controler.documentation
    
    const {
        saveUser, 
        listAllUsersForTypeUser,
        listAllUsersForTypeUserAndStatus,
        listAllStudentsNotProject,
        getAllByRegistrationOrName,  
        getUserByRegistrationOrName, 
        updateUser,
        updateUserStatus,
        updateProfileUser, 
        forgotPassword,
        resetPassword      
    } = app.src.controler.user
    
    const {
        saveProject,
        listAllProjects,
        listAllProjectsForTitle,
        listAllProjectsBySituation,
        listAllProjectsBySituationAndTitle,
        listAllProjectsByCreatedAt,
        getProjectsForAdvisor,
        getProjectsForStudent,
        updateProject,
        updateProjectCoordinator,
        deleteProject           
    } = app.src.controler.project

    const { 
        saveTask, 
        updateTaskAdvisor, 
        updateTaskStudent,
    } = app.src.controler.task

    const {
        createComment,
        updateComment,
        deleteComment 
    } = app.src.controler.comment

    const routerDefault = async (req, res) => {
        res.status(200).send("Serviço funcionando")
    }

    //rota raiz
    app.get('/', routerDefault)

    //rota de login no sistema
    app.post('/login', signin)
    // app.post('/validateToken', app.src.controler.auth.validateToken)

    //rota esqueci minha senha
    app.post('/esqueci_minha_senha', forgotPassword)

    //rota para resetar senha
    app.post('/resetar_senha', resetPassword)
    
    //===============Rotas de Cadastros de Usuários==================//
    
    //rota para cadastrar professor
    app.route('/usuarios/cadastrar_professor')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(saveUser))
        
    //rota para cadastrar Aluno
    app.route('/usuarios/cadastrar_aluno')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(saveUser))

    //rota para cadastrar Administrativo
    app.route('/usuarios/cadastrar_administrativo')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(saveUser))

    //==============rotas para Listar usuário==================//
    //Listar todos os usuários por tipo de usuário [professor, aluno ou administrativo]
    app.route('/usuarios/todos_usuarios/:userType/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(listAllUsersForTypeUser))

    //Listar todos os usuários por tipo e pelo seu status    
    app.route('/usuarios/todos_usuarios/:userType/:status/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(listAllUsersForTypeUserAndStatus))
    
    //Busca um usuário por nome ou por matrícula por tipo de usuário    
    app.route('/usuarios/listar_usuarios/:userType/:nome_ou_matricula/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(getAllByRegistrationOrName))
        
    //Busca um usuários por matrícula ou nome através de tipo e status
    app.route('/usuarios/listar_usuarios/:userType/:status/:nome_ou_matricula/:page')
        .all(app.src.config.passport.authenticate())
        .get(isCoordinator(getUserByRegistrationOrName))

    //Listar todos os alunos ativos sem projetos    
    app.route('/usuarios/listar_usuarios/aluno_sem_projeto/:page')
        .get(listAllStudentsNotProject)

    //==============rotas para Atualizar usuário==================// 
    //Atualiza informações sensíveis de alunos
    app.route('/usuarios/todos_usuarios/atualizar_aluno')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(updateUser))
    
    //Atualiza informações sensíveis de professor
    app.route('/usuarios/todos_usuarios/atualizar_professor')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(updateUser))
    
    //Atualiza informações sensíveis de administrativo    
    app.route('/usuarios/todos_usuarios/atualizar_administrativo')  
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(updateUser))

    //Atualiza informações de perfil dos usuários    
    app.route('/usuarios/atualizar_perfil')
        .all(app.src.config.passport.authenticate())
        .patch(multer(multerConfigImages).single('file'), updateProfileUser)
    
    //Atualiza apenas o status do usuário
    app.route('/usuarios/atualizar_status')
        .all(app.src.config.passport.authenticate())
        .put(isCoordinator(updateUserStatus))
    
    //===============Cadastro de Documentos relativos ao Curso==============================
    app.route('/documentos/cadastrar_documento')
        .all(app.src.config.passport.authenticate())
        .post(multer(multerConfigDocuments).single('file'), saveDocuments)
    
    //================Listando Documentos Relativos ao TCC===================================
    app.route('/documentos/listar_todos_documentos/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllDocumentation)

    //================Cadastrando Projeto=================================================
    app.route('/projeto/cadastrar_projeto')
        .post(saveProject)
    
    //================Listando Todos os Projetos==========================================    
    //Lista todos os projetos indenpendente de qualquer paramentro
    app.route('/projeto/listar_todos/:page')
        .get(listAllProjects)

    //Lista todos os projetos buscando pelo título    
    app.route('/projeto/listar_todos/titulo/:title/:page')
        .get(listAllProjectsForTitle)

    //Lista todos os projetos buscando pela situação (pré-tcc, tcc1, tcc2, concluído)
    app.route('/projeto/listar_todos/:situation/:page')
        .get(listAllProjectsBySituation)

    //Lista todos os projetos buscando pela situação (pré-tcc, tcc1, tcc2, concluído) e pelo título
    app.route('/projeto/listar_todos/:situation/:title/:page')
        .get(listAllProjectsBySituationAndTitle)

    app.route('/projeto/listar_todos/data/hora/criacao/:page')
        .get(listAllProjectsByCreatedAt)
           
    //===============Listando os projetos por um usuário==================================    
    //Listando os projetos buscando pelo professor orientador
    app.route('/projeto/professor_projetos/:page')
        .get(getProjectsForAdvisor)
    
    //Listando os projetos buscando pelo aluno     
    app.route('/projeto/aluno_projetos/:page')
        .get(getProjectsForStudent)

    //==================Atualizando Projetos=============================================
    //atualiza um projeto parte do professor
    app.route('/projeto/atualizar_projeto')
        .patch(updateProject)

    //atualiza um projeto parte da coordenação
    app.route('/projeto/atualizar_projeto/coordenacao')
        .patch(updateProjectCoordinator)
        
    //==================Deletar Projeto==================================================
    app.route('/projeto/deletar_projeto')
        .delete(deleteProject)

    //================Cadastrando Tarefas do Projeto=======================================
    app.route('/tarefas/cadastrar_tarefas')
        .post(saveTask)
    
    //================Atualizar Tarefa do Projeto==========================================
    app.route('/tarefas/atualizar_tarefa/professor')
        .patch(updateTaskAdvisor)

    app.route('/tarefas/atualizar_tarefa/aluno')
        .patch(multer(multerconfigTaskDocuments).single('file'), updateTaskStudent)

    app.route('/comentario/criar_comentario')
        .post(createComment)
    
    app.route('/comentario/atualizar_comentario')
        .patch(updateComment)

    app.route('/comentario/deletar_comentario')
        .delete(deleteComment)
}