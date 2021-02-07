const isCoordinator = require('../isCoordinator')

module.exports = app => {
    const {
        saveProject,
        listAllProjects,
        listAllProjectsForTitle,
        listAllProjectsBySituation,
        listAllProjectsBySituationAndTitle,
        listAllProjectsNotConluded,
        listAllProjectsNotConludedByTitle,
        listAllProjectsByCreatedAt,
        getProjectsForAdvisor,
        getProjectsByAdvisorForTitle,
        getProjectsByAdvisorForSituation,
        getProjectsByAdvisorForTitleAndSituation,
        getProjectsForStudent,
        getProjectNotConcluded,
        getProjectNotConcludedByTitle,
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

    //Lista todos os projetos (em andamento) menos os com situação concluído
    app.route('/projeto/todos/em_andamento/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsNotConluded)  

    //Lista todos os projetos (em andamento) filtrando por todas as situações menos a concluído
    app.route('/projeto/todos/em_andamento/:title/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsNotConludedByTitle)  

    //Lista todos os projetos filtrando pela data de criação
    app.route('/projeto/listar_todos/data/hora/criacao/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllProjectsByCreatedAt)
           
    //===============Listando os projetos por um usuário==================================    
    //Listando os projetos buscando pelo professor orientador
    app.route('/projeto/professor_projetos/:id/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsForAdvisor)

    //Listar todos os projetos de um professor filtrando pelo título
    app.route('/projeto/professor_projetos/titulo/:id/:title/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsByAdvisorForTitle)

    //Listar todos os projetos de um professor filtrando pela situação    
    app.route('/projeto/professor_projetos/situacao/:advisorId/:situation/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsByAdvisorForSituation)

    //Listar todos os projetos de um professor filtrando pelo título e pela situacao
    app.route('/projeto/professor_projetos/titulo/situacao/:advisorId/:title/:situation/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectsByAdvisorForTitleAndSituation)
    
    //Listar Todos os projetos de um professor que estão em andamento
    app.route('/projeto/professor_projeto/em_andamento/:advisorId/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectNotConcluded)

    //Listar Todos os projetos de um professor que estão em andamento por título
    app.route('/projeto/professor_projeto/em_andamento/:advisorId/:title/:page')
        .all(app.src.config.passport.authenticate())
        .get(getProjectNotConcludedByTitle)
    
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
        .patch(isCoordinator(updateProjectCoordinator))
        
    //==================Deletar Projeto==================================================
    app.route('/projeto/deletar_projeto/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteProject)

    // app.route('/testeSetInterval')
    //     .get((req, res) => {
    //         const a = 10
    //         setInterval(() => {
    //             console.log(a++)   
    //         }, 3000) 
    //     })

}