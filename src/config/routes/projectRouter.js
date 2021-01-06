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
    app.route('/projeto/professor_projetos/:id/:page')
        .get(getProjectsForAdvisor)
    
    //Listando os projetos buscando pelo aluno     
    app.route('/projeto/aluno_projetos/:id/:page')
        .get(getProjectsForStudent)

    //Buscando um projeto por Id
    app.route('/projeto/:id')
        .get(getProjectById) 
        
    //==================Atualizando Projetos=============================================
    //atualiza um projeto parte do professor
    app.route('/projeto/atualizar_projeto/:id')
        .patch(updateProject)

    //atualiza um projeto parte da coordenação
    app.route('/projeto/coordenacao/atualizar/:id')
        .patch(updateProjectCoordinator)
        
    //==================Deletar Projeto==================================================
    app.route('/projeto/deletar_projeto/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteProject)

}