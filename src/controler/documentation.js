const moment = require('moment')
const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {
    const Documentation = app.src.model.DocumentationSchema.Documentation
    const { existOrError, equalsOrError } = app.src.controler.validation

    const saveDocuments = async (req, res) => {
        try {
            existOrError(req.body.title, "Título não informado")
            const {originalname: nameDocumentation, size, key, location: url = "" } = req.file 
            const codDoc = key.split("-")
            const doc = {
            cod: codDoc[0],
                nameDocumentation,
                size,
                key,
                url,
                createdAt: moment().format()
            }

            const documentation = new Documentation()
            documentation.title = req.body.title
            documentation.documentIformation = doc
            
            const newDocumentation = await documentation.save()
            res.status(200).json({newDocumentation, menssage: "Documentação cadastrada com sucesso"})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }
    
    return { saveDocuments }
}