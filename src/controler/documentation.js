const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {
    const Documentation = app.src.model.DocumentationSchema.Documentation
    const { existOrError, equalsOrError } = app.src.controler.validation

    //Cadasto
    const saveDocuments = async (req, res) => {
        try {
            existOrError(req.body.title, "Título não informado")
            existOrError(req.file, 'Arquivo não carregado. Por favor insira um arquivo!')
            const {originalname: nameDocumentation, size, key, location: url = "" } = req.file 
            const codDoc = key.split("-")
            const doc = {
            cod: codDoc[0],
                nameDocumentation,
                size,
                key,
                url,
                createdAt: new Date()
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

    //Listagem
    const listAllDocumentation = async (req, res) => {
        try {
            const query = Documentation.find()

            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const documentation = await Documentation.paginate(query, options)
            existOrError(documentation.docs, "Nenhum documento encontrado")
            res.status(200).json(documentation)

        }catch(error) {
            if(error === "Nenhum documento encontrado") {
                res.status(400).send(error)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }   
    }

    return { 
        saveDocuments,
        listAllDocumentation
    }
}