const {isValid, parse} = require('date-fns')
module.exports = app => {
    const { existOrError, stringDateFormatCorrect, equalsOrError } = app.src.controler.validation
    const Project = app.src.model.ProjectSchema.Project
    const Orientation = app.src.model.OrientationSchema.Orientation

    const saveOrientation = async(req, res) => {
        try {
            const {
                title, description, 
                type, advisorId, 
                projectId, dateOrientation 
            } = req.body

            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(type, 'Tipo não informado')
            existOrError(advisorId, 'Id do professor não informado')
            existOrError(projectId, 'Id do projeto não informado')
            existOrError(dateOrientation, 'Data da orientação não informada')

            const project = await Project.findOne({_id: projectId})
            existOrError(project, 'Projeto não existe ou id está incorreto')

            equalsOrError(advisorId, `${project.advisor}`, 'Usuário não tem permissão para cadastrar uma orientação nesse projeto')
            
            //validar a data antes de salvar
            const newDate = parse(dateOrientation, 'dd/MM/yyyy', new Date());
            existOrError(isValid(newDate), 'Data inválida')

            const orientation = new Orientation()
            orientation.title = title
            orientation.description = description
            orientation.type = type
            orientation.advisor = advisorId
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

    return {
        saveOrientation
    }
}