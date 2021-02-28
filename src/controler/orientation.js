const {isValid, parse} = require('date-fns')
module.exports = app => {
    const { existOrError, stringDateFormatCorrect, equalsOrError } = app.src.controler.validation
    const Project = app.src.model.ProjectSchema.Project
    const Orientation = app.src.model.OrientationSchema.Orientation

    const saveOrientation = async(req, res) => {
        try {
            const {
                title, description,
                projectId, dateOrientation 
            } = req.body

            const user = req.user

            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(projectId, 'Id do projeto não informado')
            existOrError(dateOrientation, 'Data da orientação não informada')

            const project = await Project.findOne({_id: projectId})
            existOrError(project, 'Projeto não existe ou id está incorreto')

            equalsOrError(`${user._id}`, `${project.advisor}`, 'Usuário não tem permissão para cadastrar uma orientação nesse projeto')
            
            //validar a data antes de salvar
            const newDate = parse(dateOrientation, 'dd/MM/yyyy', new Date());
            existOrError(isValid(newDate), 'Data inválida')

            const orientation = new Orientation()
            orientation.title = title
            orientation.description = description
            orientation.advisor = user
            orientation.project = projectId
            orientation.dateOrientation = newDate

            const newOrientation = await orientation.save()

            project.orientation.push(newOrientation)
            await project.save()

            res.status(200).json({newOrientation, mensage: 'Orientação cadastrada com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const updateOrientation = async (req, res) => {
        try {
            const id = req.params.id
            const { title, description, dateOrientation } = req.body
            const user = req.user    

            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(dateOrientation, 'Data da orientação não informada')

            const orientation = await Orientation.findOne({_id: id})
            existOrError(orientation, 'Orientação não existe ou id da Orientação inválido')

            equalsOrError(`${user._id}`, `${orientation.advisor}`, 'Usuário não tem permissão para alterar essa orientação')
            
            const newDate = parse(dateOrientation, 'dd/MM/yyyy', new Date());
            existOrError(isValid(newDate), 'Data inválida')

            orientation.title = title
            orientation.description = description
            orientation.dateOrientation = newDate

            await orientation.save()
            res.status(200).json({orientation, mensage: 'Orientação atualizada com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const deleteOrientation = async (req, res) => {
        try {
            const id = req.params.id
            const user = req.user
            
            const deleteOrientation = await Orientation.findOne({_id: id})
            existOrError(deleteOrientation, 'Orientação não existe ou id da orientação incorreto')
            equalsOrError(`${user._id}`, `${deleteOrientation.advisor}`, 'Usuário não tem permissão para deletar a orientação')
            
            const project = await Project.findOne({_id: deleteOrientation.project})

            project.orientation.splice(project.orientation.indexOf(deleteOrientation._id),1)
            
            await project.save()
            await deleteOrientation.remove()

            res.status(200).json({mensage: 'Orientação deletada com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const listOrientationsByProject = async (req, res) => {
        try {
            const {id, page, modifier} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Orientation.find({ project: id })
                            .sort({dateOrientation: modifier}) 
                            .populate('advisor', parameters)
                
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const orientations = await Orientation.paginate(query, options)
            existOrError(orientations.docs, "Nenhuma orientação encontrada")
            res.status(200).json(orientations)
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const getOrientationByProjectForTitle = async (req, res) => {
        try{
            const {projectId, title, page, modifier} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Orientation.find({title: new RegExp(title, "i")})
                            .where({project: projectId})
                            .sort({dateOrientation: modifier}) 
                            .populate('advisor', parameters)
                
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const orientations = await Orientation.paginate(query, options)
            existOrError(orientations.docs, "Nenhuma orientação encontrada")
            res.status(200).json(orientations)
        } catch (msg) {
            res.status(400).json(msg)
        }    
    }

    const getOrientationById = async (req, res) => {
        try{
            const {id} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Orientation.findOne({_id: id})
                
            const options = {
                page: 1,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const orientations = await Orientation.paginate(query, options)
            existOrError(orientations.docs, "Nenhuma orientação encontrada")
            res.status(200).json(orientations)
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    return {
        saveOrientation,
        updateOrientation,
        deleteOrientation,
        listOrientationsByProject,
        getOrientationByProjectForTitle,
        getOrientationById
    }
}