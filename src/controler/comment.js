module.exports = app => {    
    const User = app.src.model.UserSchema.User
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment
    const Project = app.src.model.ProjectSchema.Project

    const { existOrError, equalsOrError, notEqualsOrError,compDate } = app.src.controler.validation
    
    const createComment = async(req, res) => {
        try {
            //pega infos do body
            const { projectId, taskId, userId, comment } = req.body

            //valida as informações
            existOrError(projectId, 'Id do projeto não informado')
            existOrError(taskId, 'Id da Tarefa não informado')
            existOrError(userId, 'Id do usuário não informado')
            existOrError(comment, 'Não é possível salvar um comentário vazio')

            //vai ao banco e busque o projeto
            const project = await Project.findOne({_id: projectId}).exec()
            //checa se ele existe mesmo
            existOrError(project, 'Projeto não existe ou está incorreto')
            
            //checa se a tarefa existe nesse projeto
            const checkTask = project.tasks.find(item => {
                return `${item}` === taskId
            })
            if(!checkTask) {
                return res.status(400).json('Tarefa não pertence a esse projeto')
            }

            //monta um array com os usuários do projeto e checa se eles podem criar comentários nessa tarefa
            const arrayUsers = project.students
            arrayUsers.push(project.advisor)
            const checkUser = arrayUsers.find(item => {
                return `${item}` === userId
            })
            if(!checkUser) {
                return res.status(400).json('Usuário não tem permissão')
            }	
            
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

            res.status(200).json({newComment, Mensage: 'Comentário criado com sucesso'})      
        } catch (msg) {
            console.log(msg)
            res.status(400).json(msg)
        }
    }
    
    const updateComment = async(req, res) => {
        try {
            const id = req.params.id
            const { userId, updateComment } = req.body

            existOrError(id, 'Id do comentário não informado')
            existOrError(userId, 'Id do usuário não informado')
            existOrError(updateComment, 'Não é possível salvar um comentário vazio')

            const comment = await Comment.findOne({_id: id}).exec()
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
            const id = req.params.id
            const { taskId, userId } = req.body

            //validar campos
            existOrError(id, 'Id do comentário não informado')
            existOrError(taskId, 'Id da tarefa não informado')
            existOrError(userId, 'Id do usuário não informado')

            //buscando no banco
            const comment = await Comment.findOne({_id: id}).exec()
            const task = await Task.findOne({_id: taskId}).exec()

            //busca os comentário de uma tarefa
            const objectComment = task.comments.find(item => {
                const strItem = `${item._id}`
                return strItem === id
            })

            // valida se o comentário é o mesmo que está na tarefa
            if(!objectComment) {
                return res.status(200).json('Comentário não pertence a essa tarefa ou não existe')
            }

            // valida se o usuário tem permisão para deletar apenas o comentário dele
            const strUserComment = `${comment.commentUser}`
            equalsOrError(strUserComment, userId, 'Usuário não tem permissão para alterar esse comentário')

            // user.project.splice(user.project.indexOf(project.advisor),1)
            task.comments.splice(task.comments.indexOf(comment._id),1)
            await task.save()
            await comment.remove()

            res.status(200).json({task, Mensage: 'Comentário deletado com sucesso'})
        } catch (msg) {
            console.log(msg)
            res.status(400).json(msg)
        }
    }    

    return { createComment, updateComment, deleteComment}
}
