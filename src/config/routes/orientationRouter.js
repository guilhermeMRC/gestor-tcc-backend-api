const isCoordinator = require('../isCoordinator')
module.exports = app => {
    const {
        saveOrientation, 
        updateOrientation, 
        deleteOrientation, 
        listOrientationsByProject,
        getOrientationByProjectForTitle 
    } = app.src.controler.orientation

    //salva uma orientação
    app.route('/orientacao/cadastrar_orientacao')
        .all(app.src.config.passport.authenticate())
        .post(saveOrientation)
    
    //atualiza uma orientação
    app.route('/orientacao/atualizar_orientacao/:id')
        .all(app.src.config.passport.authenticate())
        .patch(updateOrientation)
    
    //deleta uma orientação
    app.route('/orientacao/deletar_orientacao/:id')
        .all(app.src.config.passport.authenticate())
        .delete(deleteOrientation)
    
    //Lista as orientações de um projeto 
    app.route('/orientacao/orientacoes_projeto/:id/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(listOrientationsByProject)

    app.route('/orientacao/orientacoes_projeto/titulo/:projectId/:title/:modifier/:page')
        .all(app.src.config.passport.authenticate())
        .get(getOrientationByProjectForTitle)
}