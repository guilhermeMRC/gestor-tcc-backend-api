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

    //Salvar usuário
    const saveTask = async (req, res) => {
        const {title, description, deadLine, initialDate, project } = req.body
        try {
            existOrError(title, 'Título não informado')
            existOrError(description, 'Descrição não informada')
            existOrError(initialDate, 'Data inicial não informada')
            existOrError(deadLine, 'Prazo não informado')
            if(compDate(initialDate,deadLine)) res.status(400).json('Data inicial maior que o Prazo.')
            
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
                const count = Object.entries(task.finalFile).length
                if(count !== 0) {
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
                    createdAt: new Date()
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

    

    return {
        saveTask,
        updateTaskAdvisor,
        updateTaskStudent,           
    }
}