module.exports = app => {    
    const User = app.src.model.UserSchema.User
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment

    const { existOrError, equalsOrError, notEqualsOrError,compDate } = app.src.controler.validation
    
    const createComment = async(req, res) => {
        try {
            //pega infos do body
            const { taskId, userId, comment } = req.body

            //valida as informações
            existOrError(taskId, 'Id da Tarefa não informado')
            existOrError(userId, 'Id do usuário não informado')
            existOrError(comment, 'Não é possível salvar um comentário vazio')

            //procura no banco a tarefa a qual tenho que inserir comentário
            const task = await Task.findOne({_id: taskId}).exec()
            
            //crio o comentário
            const nComment = new Comment()
            nComment.commentUser = userId
            nComment.comment = comment

            //salvo o comentário no banco
            const newComment = await nComment.save()
            //add o comentário na tabela de tarefas
            task.comments.push(newComment) 
            await task.save()

            res.status(200).json({newComment, Mensage: 'Comentário criado com sucesso'} )            
        } catch (msg) {
            res.status(400).json(msg)
        }
    }
    
    const updateComment = async(req, res) => {
        try {
            const {commentId, userId, updateComment} = req.body

            existOrError(commentId, 'Id do comentário não informado')
            existOrError(userId, 'Id do usuário não informado')
            existOrError(updateComment, 'Não é possível salvar um comentário vazio')

            const comment = await Comment.findOne({_id: commentId}).exec()
            // const user = await User.findOne({_id: userId}).exec()

            const strUserComment = `${comment.commentUser}`
            equalsOrError(strUserComment, userId, 'Usuário não tem permissão para alterar esse comentário')

            comment.comment = updateComment
            await comment.save()

            res.status(200).json({comment, Mensage: 'Comentário atualizado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }
    
    const deleteComment = async(req, res) => {
        try {
            //pegando os itens do body
            const {commentId, taskId, userId} = req.body

            //validar campos
            existOrError(commentId, 'Id do comentário não informado')
            existOrError(taskId, 'Id da tarefa não informado')
            existOrError(userId, 'Id do usuário não informado')

            //buscando no banco
            const comment = await Comment.findOne({_id: commentId}).exec()
            const task = await Task.findOne({_id: taskId}).exec()

            //valida se o comentário é o mesmo que está na tarefa
            const objectComment = task.comments.find(item => {
                const strItemId = `${item._id}`
                equalsOrError(strItemId, commentId, 'Comentário não pertence a essa tarefa')    
            })

            //valida se o usuário tem permisão para deletar apenas o comentário dele
            const strUserComment = `${comment.commentUser}`
            equalsOrError(strUserComment, userId, 'Usuário não tem permissão para alterar esse comentário')

            // user.project.splice(user.project.indexOf(project.advisor),1)
            task.comments.splice(task.comments.indexOf(comment._id),1)
            await task.save()
            await comment.remove()

            res.status(200).json({task, Mensage: 'Comentário deletado com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }    

    return { createComment, updateComment, deleteComment}
}
