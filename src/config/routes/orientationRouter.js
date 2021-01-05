const isCoordinator = require('../isCoordinator')
module.exports = app => {
    const {
        saveOrientation, updateOrientation, 
        deleteOrientation 
    } = app.src.controler.orientation

    app.route('/orientacao/cadastrar_orientacao')
        .all(app.src.config.passport.authenticate())
        .post(saveOrientation)
    
    app.route('/orientacao/atualizar_orientacao/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateOrientation)
    
    app.route('/orientacao/deletar_orientacao/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteOrientation)
    
}