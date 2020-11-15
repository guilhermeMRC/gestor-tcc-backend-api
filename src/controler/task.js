const { json } = require('express')
const { use } = require('passport')

const mongoosePaginate = require('mongoose-paginate-v2');

const { parseISO } = require('date-fns');
const { format } = require('date-fns-tz');
const project = require('./project');
// const aws = require('aws-sdk')

// const s3 = new aws.S3()

module.exports = app => {    
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError, isNumeric } = app.src.controler.validation

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
            
            const findProject = await Project.findOne({_id: project}).exec()

            const newTask = new Task()
            newTask.title = title
            newTask.description = description
            newTask.initialDate = initialDate
            newTask.deadLine = deadLine
            
            const task = await newTask.save()

            findProject.tasks.push(task._id)
            await findProject.save()
            

            res.json(task)
        } catch (msg) {
            console.log(msg)
            res.json('deu erro')    
        }    
    }

    const listaAllProjects = async (req, res) => {
        
    }

    return {
        saveTask           
    }
}