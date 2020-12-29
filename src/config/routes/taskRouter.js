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
        listAllTasksByProject
    } = app.src.controler.task
    
    //================Cadastrando Tarefas do Projeto=======================================
    app.route('/tarefas/cadastrar_tarefas')
        .post(saveTask)
    
    //================Atualizar Tarefa do Projeto==========================================
    app.route('/tarefas/atualizar_tarefa/professor/:id')
        .patch(updateTaskAdvisor)

    app.route('/tarefas/atualizar_tarefa/aluno/:id')
        // .all(app.src.config.passport.authenticate())
        .patch(multer(multerconfigTaskDocuments).single('file'),updateTaskStudent)

    //=================Deletar Tarefa do Projeto============================================
    app.route('/tarefa/deletar_tarefa/:id')
        .delete(deleteTask)

    //Listar todas as tarefas de um projeto
    app.route('/tarefa/projeto_tarefas/:id/:page')
        .get(listAllTasksByProject)
 
}