const isCoordinator = require('../isCoordinator')

module.exports = app => {
    const {
        saveProject,
        listAllProjects,
        listAllProjectsForTitle,
        listAllProjectsBySituation,
        listAllProjectsBySituationAndTitle,
        listAllProjectsByCreatedAt,
        getProjectsForAdvisor,
        getProjectsForStudent,
        getProjectById,
        updateProject,
        updateProjectCoordinator,
        deleteProject           
    } = app.src.controler.project

    //================Cadastrando Projeto=================================================
    app.route('/projeto/cadastrar_projeto')
        .all(app.src.config.passport.authenticate())
        .post(saveProject)
    
    //================Listando Todos os Projetos==========================================    
    //Lista todos os projetos indenpendente de qualquer paramentro
    app.route('/projeto/listar_todos/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjects)

    //Lista todos os projetos buscando pelo título    
    app.route('/projeto/listar_todos/titulo/:title/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsForTitle)

    //Lista todos os projetos buscando pela situação (pré-tcc, tcc1, tcc2, concluído)
    app.route('/projeto/listar_todos/:situation/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsBySituation)

    //Lista todos os projetos buscando pela situação (pré-tcc, tcc1, tcc2, concluído) e pelo título
    app.route('/projeto/listar_todos/:situation/:title/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsBySituationAndTitle)

    app.route('/projeto/listar_todos/data/hora/criacao/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsByCreatedAt)
           
    //===============Listando os projetos por um usuário==================================    
    //Listando os projetos buscando pelo professor orientador
    app.route('/projeto/professor_projetos/:id/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsForAdvisor)
    
    //Listando os projetos buscando pelo aluno     
    app.route('/projeto/aluno_projetos/:id')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsForStudent)

    //Buscando um projeto por Id
    app.route('/projeto/:id')
        .all(app.src.config.passport.authenticate())
        .get(getProjectById) 
        
    //==================Atualizando Projetos=============================================
    //atualiza um projeto parte do professor
    app.route('/projeto/atualizar_projeto/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateProject)

    //atualiza um projeto parte da coordenação
    app.route('/projeto/coordenacao/atualizar/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateProjectCoordinator)
        
    //==================Deletar Projeto==================================================
    app.route('/projeto/deletar_projeto/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteProject)

}