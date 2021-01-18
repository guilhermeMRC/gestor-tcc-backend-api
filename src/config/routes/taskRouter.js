const isCoordinator = require('../isCoordinator')
const multer = require('multer')

module.exports = app => {
    const { 
        uploadTaskDocumentation: multerconfigTaskDocuments 
    } = app.src.config.multer

    const { 
        saveTask, 
        updateTaskAdvisor, 
        updateTaskStudent,
        deleteTask,
        listAllTasksByProject,
        getTasksByProjectForTitle,
        getTasksByProjectForSituation,
        getTasksByProjectForTitleAndSituation,
        getTaskById,    
    } = app.src.controler.task
    
    //================Cadastrando Tarefas do Projeto=======================================
    app.route('/tarefas/cadastrar_tarefas')
        .all(app.src.config.passport.authenticate())
        .post(saveTask)
    
    //================Atualizar Tarefa do Projeto==========================================
    app.route('/tarefas/atualizar_tarefa/professor/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateTaskAdvisor)

    app.route('/tarefas/atualizar_tarefa/aluno/:id')
        .all(app.src.config.passport.authenticate())
        .patch(multer(multerconfigTaskDocuments).single('file'),updateTaskStudent)

    //=================Deletar Tarefa do Projeto============================================
    app.route('/tarefa/deletar_tarefa/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteTask)

    //Listar todas as tarefas de um projeto
    app.route('/tarefa/projeto_tarefas/:projectId/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllTasksByProject)

    //Listar tarefas de um projeto filtrando pelo título
    app.route('/tarefa/projeto_tarefas/:projectId/:title/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(getTasksByProjectForTitle)
    
    //Listar tarefas de um projeto filtrando por situação
    app.route('/tarefa/projeto_tarefas/situacao/:projectId/:situation/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(getTasksByProjectForSituation)

    //Listar tarefas de um projeto filtrando por título e situação
    app.route('/tarefa/projeto_tarefas/situacao_titulo/:projectId/:title/:situation/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(getTasksByProjectForTitleAndSituation)

    //Listar tarefa buscando por Id
    app.route('/tarefa/:id')
        .all(app.src.config.passport.authenticate())
        .get(getTaskById)
 
    
}