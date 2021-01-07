const isCoordinator = require('../isCoordinator')
const multer = require('multer')

module.exports = app => {
    const { 
        uploadImages: multerConfigImages, 
    } = app.src.config.multer   

    const {
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
    } = app.src.controler.user

//===============Rotas de Cadastros de Usuários==================//
    
    //rota para cadastrar professor
    app.route('/usuarios/cadastrar_professor')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(saveUser))
        // .post(saveUser)
        
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
        .all(app.src.config.passport.authenticate())
        .get(listAllStudentsNotProject)

    //Listar informções de Perfil do Usuário
    app.route('/usuarios/perfil/:id')
        .all(app.src.config.passport.authenticate())
        .get(getProfileUserInfo)

    //Listar o perfil de todos os professores
    app.route('/usuarios/professores_perfil/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProfileTeacher)
        
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
    app.route('/usuarios/atualizar_perfil/:id')
        .all(app.src.config.passport.authenticate())
        .patch(multer(multerConfigImages).single('file'), updateProfileUser)
    
    //Atualiza apenas o status do usuário
    app.route('/usuarios/atualizar_status')
        .all(app.src.config.passport.authenticate())
        .put(isCoordinator(updateUserStatus))
}