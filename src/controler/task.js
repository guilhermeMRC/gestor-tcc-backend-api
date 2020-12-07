const { json } = require('express')
const { use } = require('passport')
const mongoosePaginate = require('mongoose-paginate-v2');

const { parseISO } = require('date-fns');
const { format, zonedTimeToUtc } = require('date-fns-tz');

const aws = require('aws-sdk')

const s3 = new aws.S3()

module.exports = app => {    
    //funções de validação
    const { existOrError, equalsOrError, notEqualsOrError,compDate } = app.src.controler.validation

    //Importando os models
    const User = app.src.model.UserSchema.User
    const Project = app.src.model.ProjectSchema.Project
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment

    //Salvar usuário
    const saveTask = async (req, res) => {
        const {title, description, deadLine, initialDate, project } = req.body
        try {
            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(initialDate, 'Data inicial não informada')
            existOrError(deadLine, 'Prazo não informado')
            if(compDate(initialDate,deadLine)) {
                return res.status(400).json('Data inicial maior que o Prazo.')
            } 
            
            const findProject = await Project.findOne({_id: project}).exec()

            const newTask = new Task()
            newTask.title = title
            newTask.description = description
            newTask.initialDate = initialDate
            newTask.deadLine = deadLine
            
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
            const {id, title, description, situation, initialDate, deadLine} = req.body

            existOrError(id, 'Id da tarefa não informado')
            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(initialDate, 'Data inicial, não informada')
            existOrError(deadLine, 'Data de prazo, não informado')
            if(compDate(initialDate,deadLine)) res.status(400).json('Data inicial maior que o Prazo.')

            const task = await Task.findOne({_id: id}).exec()
            
            task.title = title
            task.description = description
            task.initialDate = initialDate
            task.deadLine = deadLine
            task.situation = situation
            
            await task.save()
            res.status(200).json({task, Mensage: 'Tarefa atualizada com sucesso'}) 
        } catch (msg) {
            res.status(400).json(msg)
        } 
    }

    const updateTaskStudent = async (req, res) => {
        try {
            const {id, link} = req.body
            existOrError(id, 'Id do projeto não informado')
            if(!req.file && !link) res.json('Arquivo final ou um link da tarefa devem ser informados!')

            const task = await Task.findOne({_id: id}).exec()
            if(req.file) {
                const {originalname: nameDocument, size, key, location: url = "" } = req.file 
                //checa se o objeto está vazio se ele estiver vazio
                //ele vai até o buket e apaga o documento antigo antes de salvar a nova
                // const count = Object.entries(task.finalFile).length
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
            const date = new Date()
            const znDate = zonedTimeToUtc(date, 'America/Sao_Paulo');
            const strDate = format(znDate, 'dd/MM/yyyy', {
                timeZone: 'America/Sao_Paulo',
            })

            task.link = link
            task.deliveryDate = strDate
            
            if(compDate(task.deliveryDate, task.deadLine) === true) {
                task.situation = 'atraso'
            }else {
                task.situation = 'concluído'
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
            const { projectId, userId } = req.body

            //validando se o usuário preencheu as informações pertinentes
            existOrError(projectId, 'Id do projeto não informado')
            existOrError(userId, 'Id do usuário não informado')

            //buscando no banco de dados o projeto
            const project = await Project.findOne({_id: projectId})
            
            //validando se aquela tarefa pertence mesmo ao projeto
            const objectTask = project.tasks.find(item => {
                const strItem = `${item._id}`
                return strItem === id
            })
            if(!objectTask) {
                return res.status(400).json('Tarefa não pertence a esse projeto ou não existe')
            }
            
            //checa se o usuário tem permisão para apagar essa tarefa
            equalsOrError(`${project.advisor}`,userId, 'Usuário não tem permisão para deletar essa tarefa')

            //Se ele passou daqui é hora de apagar
            //vai ao banco e traz a tarefa que será apagada
            const deleteTask = await Task.findOne({_id: id}) 
            
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
            console.log(msg)
            res.status(400).json(msg)  
        }
        //ter o id do projeto para poder buscar quem são os envolvidos 
        //e comparar com o id do usuário para barrar caso não tenha permissão

        //pegar o id da tarefa que desejo deletar

        //pegar a tarefa no banco para poder pegar os comentários e deletalos

        //ver ser tem arquivo e deletar no s3

        //apagar a tarefa no projeto 

        //apagar a tarefa de fato
    }

    return {
        saveTask,
        updateTaskAdvisor,
        updateTaskStudent,
        deleteTask           
    }
}