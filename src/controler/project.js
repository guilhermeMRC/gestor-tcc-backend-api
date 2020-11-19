const { json } = require('express')
const { use } = require('passport')

const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment');
const user = require('./user');
// const aws = require('aws-sdk')

// const s3 = new aws.S3()

module.exports = app => {    
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError, notEqualsOrError } = app.src.controler.validation

    //Importando os models
    const User = app.src.model.UserSchema.User
    const Project = app.src.model.ProjectSchema.Project

    //Salvar usuário
    const saveProject = async (req, res) => {
        const { title, description, studentOne, studentTwo, advisor } = req.body
        try {
            existOrError(title, 'Título não informado.')
            existOrError(description, 'Descrição não informada.')
            existOrError(studentOne, 'Pelo menos um aluno deve ser informado.')
            existOrError(advisor, 'Usuário deve estar logado.')
            
            //vai checar no banco se o professor está ou não disponivel
            const teachear = await User.findOne({_id: advisor}).exec()
            
            if(teachear.available !== 'sim') {
                return res.status(400).json('Professor deve estar disponivel para cadastrar um projeto! Por favor altere sua disponibilidade para sim')
            }

            const project = new Project()
            project.title = title
            project.description = description
            project.advisor = advisor

            if(!studentTwo) {
                project.students = [studentOne]
                const studentA = await User.findOne({_id: studentOne}).exec()

                const newProject = await project.save()

                teachear.project.push(newProject._id)
                studentA.project = newProject._id

                await teachear.save()
                await studentA.save()

                res.status(200).json({user: newProject, resposta: "Projeto Cadastrado com sucesso"})

            }else {
                project.students = [studentOne, studentTwo]
            
                const studentA = await User.findOne({_id: studentOne}).exec()
                const studentB = await User.findOne({_id: studentTwo}).exec()

                const newProject = await project.save()

                teachear.project.push(newProject._id)
                studentA.project = newProject._id
                studentB.project = newProject._id

                await teachear.save()
                await studentA.save()
                await studentB.save()

                res.status(200).json({user: newProject, resposta: "Projeto Cadastrado com sucesso"})
            }
                       
        }catch (msg) {
            console.log(msg)
            return res.status(400).send(msg)
        }    
    }

    const listaAllProjects = async (req, res) => {
        try {
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find()
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('tasks')
              
            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const projects = await Project.paginate(query, options)
            existOrError(projects.docs, "Nenhum projeto encontrado")
            res.status(200).json(projects)

        }catch(msg) {
            
            if(msg === "Nenhum projeto encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }
    }

    const getProjectsForAdvisor = async (req, res) => {
        try {
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({ advisor: req.body.id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('tasks')
              
            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const projects = await Project.paginate(query, options)
            existOrError(projects.docs, "Nenhum projeto encontrado")
            res.status(200).json(projects)

        }catch(msg) {
            
            if(msg === "Nenhum projeto encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }
    }

    const getProjectsForStudent = async (req, res) => {
        try {
            // const user = await User.findOne({_id: req.body.id})
            // existOrError(user.project,'Não possui projeto')
            // res.json(user) 
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({ students: req.body.id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('tasks')
              
            let page = req.params.page    
            const options = {
                page: page,
                limit: 10,
                collation: {
                    locale: 'pt'
                }
            };       

            const projects = await Project.paginate(query, options)
            existOrError(projects.docs, "Nenhum projeto encontrado")
            res.status(200).json(projects)

        }catch(msg) {
            
            if(msg === "Nenhum projeto encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }        
        }
    }

    //Atualizar Projetos
    const UpdateProject = async (req, res) => {
        try {
            const { id, title, description, studentOne, studentTwo, situation } = req.body
            existOrError(id, 'Id não informado')
            existOrError(title, 'Titulo, não informado')
            existOrError(description, 'Descrição não informada')
            
            const project = await Project.findOne({_id: id}).exec()
            project.title = title
            project.description = description
            project.situation = situation

            if(!studentOne && !studentTwo) 
                res.status(400).json('Um projeto precisa ter pelo menos um aluno preenchido')

            if(studentOne && !studentTwo) {
                await User.findByIdAndUpdate(project.students[0], { project: [] })
                await User.findByIdAndUpdate(project.students[1], { project: [] })

                project.students = studentOne
                await project.save()

                await User.findByIdAndUpdate(studentOne, { project: id })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})
            }

            if(!studentOne && studentTwo) {
                await User.findByIdAndUpdate(project.students[0], { project: [] })
                await User.findByIdAndUpdate(project.students[1], { project: [] })

                project.students = studentTwo
                await project.save()

                await User.findByIdAndUpdate(studentTwo, { project: id })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})
            }

            if(studentOne && studentTwo) {
                notEqualsOrError(studentOne, studentTwo, 'Não podem ser iguais')

                await User.findByIdAndUpdate(project.students[0], { project: [] })
                await User.findByIdAndUpdate(project.students[1], { project: [] })

                project.students = [studentOne, studentTwo] 
                await project.save()

                await User.findByIdAndUpdate(studentOne, { project: id })
                await User.findByIdAndUpdate(studentTwo, { project: id })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})

            } 
            
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    return {
        saveProject,
        listaAllProjects,
        getProjectsForAdvisor,
        getProjectsForStudent,
        UpdateProject           
    }
}