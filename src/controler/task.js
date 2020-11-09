const { json } = require('express')
const { use } = require('passport')

const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment');
const user = require('./user');
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
        const {title, description, deadline, deliveryDate, notes } = req.body
        try {
            // existOrError(title, 'Título não informado')
            // existOrError(description, 'Descrição não informada')
            // existOrError(deadline, 'Prazo não informado')
            // existOrError(deliveryDate, 'Data de entrega não informada')
            
            // const newTask = new Task()
            // newTask.title = title
            // newTask.description = description
            // moment.locale()
            // const deadlineMilisecunds = moment.
            res.json('ainda não funciona kkkkkk')

            // if(notes) {
                
            // }
        } catch (msg) {
            res.json('deu erro')    
        }    
    }

    const listaAllProjects = async (req, res) => {
        
    }

    return {
        saveTask           
    }
}