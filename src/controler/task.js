const { json } = require('express')
const { use } = require('passport')
const mongoosePaginate = require('mongoose-paginate-v2');
const { isValid, parse, isAfter, parseISO } = require('date-fns')
const { zonedTimeToUtc, utcToZonedTime, format, toDate } = require('date-fns-tz')

const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {
    
    //inportando o transporte para envio de email
    const transporter = app.src.controler.nodemailer.transporter

    //importando template do e-mail formatado
    const { formatNotificationSaveTask, formatNotificationDeliveryTask } = app.src.resources.template_email

    //funções de validação
    const { 
        existOrError, 
        equalsOrError, 
        notEqualsOrError,
        stringDateFormatCorrect,
        compDate, 
        deleteS3 
    } = app.src.controler.validation

    //Importando os models
    const User = app.src.model.UserSchema.User
    const Project = app.src.model.ProjectSchema.Project
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment

    //Salvar usuário
    const saveTask = async (req, res) => {
        const { title, description, deadLine, initialDate, projectId } = req.body
        const user = req.user
        try {
            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(initialDate, 'Data inicial não informada')
            existOrError(deadLine, 'Prazo não informado')
            existOrError(projectId, 'Id do projeto não informado')
            
            const newInitialDate = parse(initialDate, 'dd/MM/yyyy', new Date())
            const newDeadLine = parse(deadLine, 'dd/MM/yyyy', new Date())
            
            existOrError(isValid(newInitialDate), 'Data inicial inválida')
            existOrError(isValid(newDeadLine), 'Prazo final inválido')
            
            if(isAfter(newInitialDate, newDeadLine)) {
                return res.status(400).json('Data inicial não pode ser maior que o prazo')
            }
            
            const parameters = ['_id', 'name', 'email']
            const findProject = await Project.findOne({_id: projectId})
                .populate('students', parameters)
            existOrError(findProject, 'Id do projeto incorreto ou não existe')

            equalsOrError(`${findProject.advisor}`,`${user._id}`, 'Usuário não tem permissão para cadastrar uma tarefa')

            const newTask = new Task()
            newTask.title = title
            newTask.description = description
            newTask.initialDate = newInitialDate
            newTask.deadLine = newDeadLine
            newTask.project = projectId

            //pegando os e-mails dos alunos
            const studentsEmail = []
            findProject.students.filter(b => {
                studentsEmail.push(b.email)
            })

            const defaultAdminEmail = process.env.SMTP_USER
            const constructEmail = formatNotificationSaveTask(newTask.title)
            const mailSent = await transporter.sendMail({
                from: defaultAdminEmail,
                to: studentsEmail,
                subject: "Nova tarefa postada.",
                html: constructEmail
            })
            existOrError(mailSent, 'Erro ao enviar o e-mail')

            const task = await newTask.save()

            findProject.tasks.push(task._id)
            await findProject.save()
            
            res.status(200).json({task, Mensage: 'Tarefa Cadastrada com Sucesso'})
        } catch (msg) {
            res.status(400).json(msg)    
        }    
    }

    const updateTaskAdvisor = async (req, res) => {
        try {
            const id = req.params.id
            const {title, description, situation, initialDate, deadLine } = req.body
            const user = req.user

            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(initialDate, 'Data inicial, não informada')
            existOrError(deadLine, 'Data de prazo, não informado')
            existOrError(situation, 'Situação deve ser informada')
            
            const newInitialDate = parse(initialDate, 'dd/MM/yyyy', new Date());
            const newDeadLine = parse(deadLine, 'dd/MM/yyyy', new Date()); 
            existOrError(isValid(newInitialDate), 'Data inicial inválida')
            existOrError(isValid(newDeadLine), 'Prazo final inválido')
            
            if(isAfter(newInitialDate, newDeadLine)) {
                return res.status(400).json('Data inicial não pode ser maior que o prazo')
            }

            const task = await Task.findOne({_id: id}).exec()
            existOrError(task, 'Id da tarefa incorreto ou não existe')

            const project = await Project.findOne({_id: task.project})
            existOrError(project, 'Id do projeto incorreto ou não existe')
            equalsOrError(`${project.advisor}`, `${user._id}`, 'Usuário não tem permissão para alterar essa tarefa')
            
            task.title = title
            task.description = description
            task.initialDate = newInitialDate
            task.deadLine = newDeadLine
            task.situation = situation
            
            //não alterar tarefa situação mexer depois
            await task.save()
            res.status(200).json({task, Mensage: 'Tarefa atualizada com sucesso'}) 
        } catch (msg) {
            res.status(400).json(msg)
        } 
    }

    const updateSituationTaskAdvisor = async (req, res) => {
        
        try{
            const user = req.user
            const id = req.params.id
            const {situation, deadLine, comment} = req.body
            
            const newDeadLine = parse(deadLine, 'dd/MM/yyyy', new Date()); 
            existOrError(isValid(newDeadLine), 'Prazo final inválido')

            const task = await Task.findOne({_id: id})
            existOrError(task, 'Id da tarefa incorreto ou não existe essa tarefa cadastrada')
            
            const project = await Project.findOne({_id: task.project})
            existOrError(project, 'Projeto não ixiste')
            
            equalsOrError(`${project.advisor}`, `${user._id}`, 'Usuário não tem permissão para alterar essa tarefa')

            task.situation = situation
            task.deadLine = newDeadLine
            if(comment) {
                const nComment = new Comment()
                nComment.commentUser = user._id
                nComment.comment = comment
                nComment.task = task._id

                const newComment = await nComment.save()
                task.comments.push(newComment) 
            }

            await task.save()

            res.status(200).json(task)

        }catch(msg) {
            console.log(msg)
            res.status(400).json(msg)
        }
    }

    const updateTaskStudent = async (req, res) => {
        try {
            const id = req.params.id
            const { link } = req.body
            const user = req.user
            
            if(!req.file && !link) {
                return res.status(400).json('Arquivo final ou um link da tarefa devem ser informados!')
            } 

            const task = await Task.findOne({_id: id}).exec()
            if(!task) {
                deleteS3(req, process.env.AWS_STORAGE_TASK_DOCUMENT)
                return res.status(400).json('Id da tarefa incorreto ou não existente')     
            }
            
            const parameters = ['_id', 'name', 'email']
            const project = await Project.findOne({_id: task.project})
                .populate('students', parameters)
                .populate('advisor', parameters)
            if(!project) {
                deleteS3(req, process.env.AWS_STORAGE_TASK_DOCUMENT)
                return res.status(400).json('Id do projeto incorreto ou não existe')     
            }
            
            let compUser = false
            const studentsNames = []
            project.students.forEach(item => {
                studentsNames.push(item.name)
                if(`${item._id}` === `${user._id}`) {
                    return compUser = true
                }
            })
            if(compUser === false) {
                deleteS3(req, process.env.AWS_STORAGE_TASK_DOCUMENT)
                return res.status(400).json('Usuário não tem permissão para alterar essa tarefa')    
            }

            const defaultAdminEmail = process.env.SMTP_USER
            const constructEmail = formatNotificationDeliveryTask(task.title, studentsNames, project.title)
            const mailSent = await transporter.sendMail({
                from: defaultAdminEmail,
                to: project.advisor.email,
                subject: "Tarefa Entregue.",
                html: constructEmail
            })
            if(!mailSent) {
                deleteS3(req, process.env.AWS_STORAGE_TASK_DOCUMENT)
                return res.status(400).json('E-mail não enviado. Cheque o cliente de e-mail!') 
            }

            if(req.file) {
                const {originalname: nameDocument, size, key, location: url = "" } = req.file 
                if(task.finalFile.key !== '') {
                    s3.deleteObject({
                        Bucket: process.env.AWS_STORAGE_TASK_DOCUMENT,
                        Key: task.finalFile.key   
                    }).promise()
                }
                
                const codDocument = key.split("-")
                const document = {
                    cod: codDocument[0],
                    nameDocument,
                    size,
                    key,
                    url,
                }
                task.finalFile = document
            }
        
            task.link = link
            task.deliveryDate = new Date()
            
            if(isAfter(task.deliveryDate, task.deadLine)) {
                task.situation = 'entregue com atraso'    
            }else {
                task.situation = 'entregue'   
            }
            
            await task.save()
            res.status(200).json({task, Mensage: 'Tarefa alterada com sucesso'})
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const deleteTask = async (req, res) => {
        try {
            //pegando as informações
            const id = req.params.id
            const user = req.user
            //validando se aquela tarefa pertence mesmo ao projeto
            //vai ao banco e traz a tarefa que será apagada
            const deleteTask = await Task.findOne({_id: id})
            existOrError(deleteTask, 'Id da tarefa incorreto ou não existente')
            
            //buscando no banco de dados o projeto
            const project = await Project.findOne({_id: deleteTask.project})
            existOrError(project, 'Projeto incorreto ou não existe')
            //checa se o usuário tem permisão para apagar essa tarefa
            equalsOrError(`${project.advisor}`,`${user._id}`, 'Usuário não tem permisão para deletar essa tarefa')

            //checa se tem algum arquivo vinculado no s3, se tiver será apagado
            if(deleteTask.finalFile.key !== '') {
                s3.deleteObject({
                    Bucket: process.env.AWS_STORAGE_TASK_DOCUMENT,
                    Key: deleteTask.finalFile.key  
                }).promise()
            }

            //checa se tem comentarios no array caso tenha ele vai apaga-los na tabela
            if(deleteTask.comments.length > 0) {
                deleteTask.comments.forEach(item => {
                    Comment.findByIdAndRemove({_id: item}).then()
                })    
            }

            //ir até o projeto e retirar do array de tasks
            project.tasks.splice(project.tasks.indexOf(deleteTask._id),1)
            //apagar a task e dar um update em projeto
            await project.save()
            await deleteTask.remove()

            res.status(200).json({Mensage: 'Tarefa Deletada com sucesso!'})
            
        } catch (msg) {
            res.status(400).json(msg)  
        }
    }

    const listAllTasksByProject = async (req, res) => {
        try {
            const {projectId, modifier, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({project: projectId})
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }
    }

    const getTasksByProjectForTitle = async (req, res) => {
        try{
            const {projectId, title, modifier,page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({title: new RegExp(title, "i")})
                            .where({project: projectId})
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }
    }

    const getTasksByProjectForSituation = async (req, res) => {
        try {
            const {projectId, situation, modifier, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({project: projectId})
                            .where({situation: situation})
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }
    }

    const getTasksByProjectForTitleAndSituation = async (req, res) => {
        try{
            const {projectId, title, situation, modifier, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({title: new RegExp(title, "i")})
                            .and([{project: projectId}, {situation: situation}])
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }
    }

    const getTasksByProjectNotConcluded = async (req, res) => {
        try{
            const {projectId, modifier, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({project: projectId})
                            .nor({situation: 'concluída'})
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }       
    }

    const getTasksByProjectNotConcludedForTitle = async (req, res) => {
        try{
            const {projectId, title, modifier, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({title: new RegExp(title, "i")})
                            .where({project: projectId})
                            .nor({situation: 'concluída'})
                            .sort({deadLine: modifier}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const tasks = await Task.paginate(query, options)
            existOrError(tasks.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(tasks)    
        } catch (msg) {
            res.status(400).json(msg)      
        }
    }

    const getTaskById = async (req, res) => {
        try {
            const id = req.params.id
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Task.find({_id: id}) 
                            .populate(
                                {
                                    path: 'comments', 
                                    populate: {
                                        path: 'commentUser', select: parameters
                                    }
                                })
               
            const options = {
                page: 1,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const task = await Task.paginate(query, options)
            existOrError(task.docs, "Nenhuma tarefa encontrada")
            res.status(200).json(task)
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    return {
        saveTask,
        updateTaskAdvisor,
        updateSituationTaskAdvisor,
        updateTaskStudent,
        deleteTask,
        listAllTasksByProject,
        getTasksByProjectForTitle,
        getTasksByProjectForSituation,
        getTasksByProjectForTitleAndSituation,
        getTasksByProjectNotConcluded,
        getTasksByProjectNotConcludedForTitle,
        getTaskById    
    }
}