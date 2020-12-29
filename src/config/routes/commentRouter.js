const isCoordinator = require('../isCoordinator')
module.exports = app => {
    const {
        createComment,
        updateComment,
        deleteComment 
    } = app.src.controler.comment

    //=================Criar Comentário====================================================
    app.route('/comentario/criar_comentario')
        .post(createComment)
    
    app.route('/comentario/atualizar_comentario/:id')
        .patch(updateComment)

    app.route('/comentario/deletar_comentario/:id')
        .delete(deleteComment)
}