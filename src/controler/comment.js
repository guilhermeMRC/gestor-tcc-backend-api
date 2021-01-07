module.exports = app => {    
    const User = app.src.model.UserSchema.User
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment
    const Project = app.src.model.ProjectSchema.Project

    const { existOrError, equalsOrError, notEqualsOrError,compDate } = app.src.controler.validation
    
    const createComment = async(req, res) => {
        try {
            //pega infos do body
            const { taskId, comment } = req.body
            const user = req.user

            //valida as informações
            existOrError(taskId, 'Id da Tarefa não informado')
            existOrError(comment, 'Não é possível salvar um comentário vazio')

            //procura no banco a tarefa a qual tenho que inserir comentário
            const task = await Task.findOne({_id: taskId}).exec()
            //vai ao banco e busque o projeto
            existOrError(task, 'Tarefa não ixiste ou id está incorreto')
            
            const project = await Project.findOne({_id: task.project}).exec()
            //checa se ele existe mesmo
            existOrError(project, 'Projeto não existe ou está incorreto')

            //monta um array com os usuários do projeto e checa se eles podem criar comentários nessa tarefa
            const arrayUsers = project.students
            arrayUsers.push(project.advisor)
            const checkUser = arrayUsers.find(item => {
                return `${item}` === `${user._id}`
            })
            if(!checkUser) {
                return res.status(400).json('Usuário não tem permissão')
            }	
            
            //crio o comentário
            const nComment = new Comment()
            nComment.commentUser = user._id
            nComment.comment = comment
            nComment.task = task._id

            //salvo o comentário no banco
            const newComment = await nComment.save()
            //add o comentário na tabela de tarefas
            task.comments.push(newComment) 
            await task.save()

            res.status(200).json({newComment, Mensage: 'Comentário criado com sucesso'})      
        } catch (msg) {
            res.status(400).json(msg)
        }
    }
    
    const updateComment = async(req, res) => {
        try {
            const id = req.params.id
            const { updateComment } = req.body
            const user = req.user

            existOrError(id, 'Id do comentário não informado')
            existOrError(updateComment, 'Não é possível salvar um comentário vazio')

            const comment = await Comment.findOne({_id: id}).exec()
            
            equalsOrError(`${comment.commentUser}`, `${user._id}`, 'Usuário não tem permissão para alterar esse comentário')

            comment.comment = updateComment
            await comment.save()

            res.status(200).json({comment, Mensage: 'Comentário atualizado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }
    
    const deleteComment = async(req, res) => {
        try {
            const id = req.params.id
            const user = req.user

            //validar campos
            existOrError(id, 'Id do comentário não informado')

            //buscando no banco
            const comment = await Comment.findOne({_id: id}).exec()
            const task = await Task.findOne({_id: comment.task}).exec()

            // valida se o usuário tem permisão para deletar apenas o comentário dele
            equalsOrError(`${comment.commentUser}`, `${user._id}`, 'Usuário não tem permissão para alterar esse comentário')

            task.comments.splice(task.comments.indexOf(comment._id),1)
            await task.save()
            await comment.remove()

            res.status(200).json({Mensage: 'Comentário deletado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }    

    return { createComment, updateComment, deleteComment}
}
