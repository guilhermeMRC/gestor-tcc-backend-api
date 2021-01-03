const isCoordinator = require('../isCoordinator')
module.exports = app => {
    const {saveOrientation } = app.src.controler.orientation

    app.route('/orientacao/cadastrar_orientacao')
        .post(saveOrientation)
    
}