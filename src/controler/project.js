const { json } = require('express')
const { use } = require('passport')

const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment');

// const aws = require('aws-sdk')

// const s3 = new aws.S3()

module.exports = app => {    
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError, notEqualsOrError } = app.src.controler.validation

    //Importando os models
    const User = app.src.model.UserSchema.User
    const Project = app.src.model.ProjectSchema.Project
    const Task = app.src.model.TaskSchema.Task

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

    const listAllProjects = async (req, res) => {
        try {
            const parameters = ['_id', 'name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find()
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
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

    const listAllProjectsBySituation = async (req, res) => {
        try {
            const { situation, page } = req.params
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({ situation: situation })
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
            // let paginate = page    
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

    const listAllProjectsBySituationAndTitle = async (req, res) => {
        try {
            const {situation, title, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({title: new RegExp(title, "i")})
                            .where('situation')
                            .equals(situation)
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
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

    const listAllProjectsForTitle = async (req, res) => {
        try {
            const parameters = ['name', 'registration', 'status', 'userType']
            const paramtitle = req.params.title 
            const query = Project.find({title: new RegExp(paramtitle, "i")})
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
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

    const listAllProjectsByCreatedAt = async (req, res) => {
        try {
            const { page } = req.params
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find()
                            .sort({createdAt: -1}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
            // let paginate = page    
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
            const {id, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({ advisor: id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
                 
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
            const {id, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType']
            const query = Project.find({ students: id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate(
                                {
                                    path: 'tasks', 
                                    populate: {
                                        path: 'comments', 
                                        populate: {
                                            path: 'commentUser', select: parameters
                                        }
                                    }
                                })
              
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
    const updateProject = async (req, res) => {
        try {
            const id = req.params.id
            const { title, description, studentOne, studentTwo, situation } = req.body
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

    const updateProjectCoordinator = async (req, res) => {
        try {
            //pega as info do req
            const { id, advisor } = req.body

            //valida se não esta faltando o id do projeto e nem o id do prof 
            existOrError(id, 'Id não informado')
            existOrError(advisor, 'Professor orientador não informado')
            
            //vai ao banco e busca o projeto e o usuário antigo e o novo que iremos atualizar e
            const project = await Project.findOne({_id: id}).exec()
            const oldUser = await User.findOne({_id: project.advisor}).exec()
            const newUser = await User.findOne({_id: advisor}).exec()
            
            //checa se os usuários forem iguais não faz nada
            if(oldUser.equals(newUser)) {
                res.status(200).json({project, Mensage: 'Projeto atualizado com sucesso'})
            }else{
                //removendo o projeto do array de usuário antigo
                oldUser.project.splice(oldUser.project.indexOf(project._id),1)

                //add o projeto no array do novo usuário
                newUser.project.push(project._id)

                //add o novo professor no projeto
                project.advisor = newUser._id
                await project.save()
                await oldUser.save()
                await newUser.save()
                res.status(200).json({project, Mensage: 'Projeto alterado com sucesso'})
            }
            
        } catch (msg) {
            res.status(400).json(msg)
        }   
    }

    const deleteProject = async (req, res) => {
        try {
        //     existOrError(req.body.id, 'Id do projeto não informado')

        //     project = await Project.findOne({_id: req.body.id})
            // project.tasks.forEach(task => {
            //     Task.findByIdAndRemove({_id: task}).then(a => {
            //         console.log(a)
            //         //apagar os arquivos que estiverem no bucket 
            //     })        
            // })
            // project.students.forEach(user => {
            //     User.findByIdAndUpdate(user, {project: []}).then(a => {
            //         console.log(a.project)
            //     })
            // })
            // const user = await User.findOne({_id: project.advisor}).exec()
            // user.project.splice(user.project.indexOf(project.advisor),1)
            // await user.save()
            // await project.remove()
            
            res.status(200).json({Mensage: 'Projeto deletado com sucesso'})
        } catch (msg) {
            
            res.status(400).json({Mensage: 'Erro ao deletar um projeto'})
        }
    }

    return {
        saveProject,
        listAllProjects,
        listAllProjectsForTitle,
        listAllProjectsBySituation,
        listAllProjectsBySituationAndTitle,
        listAllProjectsByCreatedAt,
        getProjectsForAdvisor,
        getProjectsForStudent,
        updateProject,
        updateProjectCoordinator,
        deleteProject           
    }
}