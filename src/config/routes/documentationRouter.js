const isCoordinator = require('../isCoordinator')
const multer = require('multer')

module.exports = app => {
    const { 
        uploadDocumentation: multerConfigDocuments, 
    } = app.src.config.multer

    const { 
        saveDocuments, 
        updateDocuments, 
        deleteDocuments,
        listAllDocumentation 
    } = app.src.controler.documentation

    //===============Cadastro de Documentos relativos ao Curso==============================
    app.route('/documentos/cadastrar_documento')
        .all(app.src.config.passport.authenticate())
        .post(isCoordinator(multer(multerConfigDocuments).single('file')), saveDocuments)
    
    //==============Editar Documentos Relativos ao Curso===================================
    app.route('/documentos/atualizar_documento/:id')
        .all(app.src.config.passport.authenticate())
        .patch(isCoordinator(multer(multerConfigDocuments).single('file')), updateDocuments)

    //==============Deletando Documentos Relativos ao Curso================================
    app.route('/documentos/deletar_documento/:id')
        .all(app.src.config.passport.authenticate())
        .delete(isCoordinator(deleteDocuments))

    //================Listando Documentos Relativos ao TCC===================================
    app.route('/documentos/listar_todos_documentos/:page')
        .all(app.src.config.passport.authenticate())
        .get(listAllDocumentation)

}