const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {
    const User = app.src.model.UserSchema.User
    const Documentation = app.src.model.DocumentationSchema.Documentation
    const { existOrError, equalsOrError } = app.src.controler.validation
    const { 
        uploadImages: multerConfigImages, 
        uploadDocumentation: multerConfigDocuments, 
        uploadTaskDocumentation: multerconfigTaskDocuments 
} = app.src.config.multer

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
            }

            const documentation = new Documentation()
            documentation.title = req.body.title
            documentation.documentIformation = doc
            
            const newDocumentation = await documentation.save()
            res.status(200).json({newDocumentation, menssage: "Documentação cadastrada com sucesso"})
        } catch (msg) {
            // console.log(msg)
            req.file = undefined
            console.log(req.file)
            res.status(400).json(msg)
        }        
    }

    const updateDocuments = async (req, res) => {
        try {
            const id = req.params.id
            const title = req.body.title
            existOrError(title, 'Título não informado')

            const document = await Documentation.findOne({_id: id})
            existOrError(document, 'Id do documento incorreto ou não existe')

            if(req.file){
                const {originalname: nameDocumentation, size, key, location: url = "" } = req.file 
                
                if(document.documentIformation.key !== '') {
                    s3.deleteObject({
                        Bucket: process.env.AWS_STORAGE_DOCUMENTATION,
                        Key: document.documentIformation.key   
                    }).promise()
                }
                
                const codDoc = key.split("-")
                const doc = {
                    cod: codDoc[0],
                    nameDocumentation,
                    size,
                    key,
                    url,
                }
                document.documentIformation = doc    
            }

            document.title = title
            await document.save()
            res.status(200).json({document, Mensage: 'Documento atualizado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const deleteDocuments = async (req, res) => {
        try {
            const id = req.params.id
            const docDelete = await Documentation.findOne({_id: id})
            existOrError(docDelete, 'Id do documento incorreto ou não existe')

            s3.deleteObject({
                Bucket: process.env.AWS_STORAGE_DOCUMENTATION,
                Key: docDelete.documentIformation.key   
            }).promise()

            await docDelete.remove()
            res.status(200).json({ Mensage: 'Documento deletado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg) 
        }
    }

    //Lista todos os documentos
    const listAllDocumentation = async (req, res) => {
        try {
            const query = Documentation.find().sort({title: 'asc'})

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

    const getDocumentationByTitle = async (req, res) => {
        try {
            const {title, page} = req.params
            const query = Documentation.find({title: new RegExp(title, "i")}).sort({title: 'asc'})

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

        }catch(msg) {
            
            if(msg === "Nenhum documento encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }        
    }

    return { 
        saveDocuments,
        updateDocuments,
        deleteDocuments,
        listAllDocumentation,
        getDocumentationByTitle
    }
}