const isCoordinator = require('../isCoordinator')
module.exports = app => {
    const {
        createComment,
        updateComment,
        deleteComment 
    } = app.src.controler.comment

    //=================Criar Comentário====================================================
    app.route('/comentario/criar_comentario')
        .all(app.src.config.passport.authenticate())
        .post(createComment)
    
    app.route('/comentario/atualizar_comentario/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateComment)

    app.route('/comentario/deletar_comentario/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteComment)
}