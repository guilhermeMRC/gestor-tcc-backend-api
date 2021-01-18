const { json } = require('express')
const { use } = require('passport')

const mongoosePaginate = require('mongoose-paginate-v2');

const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {    
    //funções de validação
    const { existOrError, notExistsOrError, equalsOrError, notEqualsOrError } = app.src.controler.validation

    //Importando os models
    const User = app.src.model.UserSchema.User
    const Project = app.src.model.ProjectSchema.Project
    const Task = app.src.model.TaskSchema.Task
    const Comment = app.src.model.CommentSchema.Comment
    const Orientation = app.src.model.OrientationSchema.Orientation

    //Salvar usuário
    const saveProject = async (req, res) => {
        const { title, description, studentOne, studentTwo, advisor } = req.body
        try {
            //validações de campo
            existOrError(title, 'Título não informado.')
            existOrError(description, 'Descrição não informada.')
            existOrError(advisor, 'Usuário deve estar logado.')
            
            //checa se os dois campos de estudantes estão vazios
            if(!studentOne && !studentTwo) {
                return res.status(400).json('Pelo menos um aluno deve ser informado.')
            }    

            //vai checar no banco se o professor está ou não disponivel
            const teachear = await User.findOne({_id: advisor}).exec()
            if(teachear.available !== 'sim') {
                return res.status(400).json('Professor deve estar disponivel para cadastrar um projeto! Por favor altere sua disponibilidade para sim')
            }

            //se tudo está nos conformes ele começa a criar o projeto
            const project = new Project()
            project.title = title
            project.description = description
            project.advisor = advisor

            //checa qual dos alunos está preenchido e segue o o código
            //se o primeiro não está, mas o segundo está
            if(!studentOne && studentTwo) {
                project.students = [studentTwo]
                const studentB = await User.findOne({_id: studentTwo}).exec()
                if(studentB.project[0]) {
                    return res.status(400).json('Aluno faz parte de outro projeto. Não é possível cadastrar-lo.')
                }
                const newProject = await project.save()
    
                teachear.project.push(newProject._id)
                studentB.project = newProject._id
                studentB.available = 'não'
    
                await teachear.save()
                await studentB.save()
    
                res.status(200).json({user: newProject, resposta: "Projeto Cadastrado com sucesso"})                
            }

            if(studentOne && !studentTwo) {
                project.students = [studentOne]
                const studentA = await User.findOne({_id: studentOne}).exec()
                if(studentA.project[0]) {
                    return res.status(400).json('Aluno faz parte de outro projeto. Não é possível cadastrar-lo.')
                }
    
                const newProject = await project.save()

                teachear.project.push(newProject._id)
                studentA.project = newProject._id
                studentA.available = 'não'

                await teachear.save()
                await studentA.save()

                res.status(200).json({user: newProject, resposta: "Projeto Cadastrado com sucesso"})
            }
            
            //Se os dois campos estiverem preenchidos
            if(studentOne && studentTwo) {
                notEqualsOrError(studentOne,studentTwo,'Não é possível cadastrar dois alunos com mesmo id')
                project.students = [studentOne, studentTwo]
            
                const studentA = await User.findOne({_id: studentOne}).exec()
                const studentB = await User.findOne({_id: studentTwo}).exec()
                if(studentA.project[0] || studentB.project[0]) {
                    return res.status(400).json('Aluno faz parte de outro projeto. Não é possível cadastrar-lo.')
                }
                const newProject = await project.save()
    
                teachear.project.push(newProject._id)
                studentA.project = newProject._id
                studentA.available = 'não'
                studentB.project = newProject._id
                studentB.available = 'não'
                await teachear.save()
                await studentA.save()
                await studentB.save()
    
                res.status(200).json({user: newProject, resposta: "Projeto Cadastrado com sucesso"})  
            }
                       
        }catch (msg) {
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
                            .populate('orientation')
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
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({ situation: situation })
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({title: new RegExp(title, "i")})
                            .where('situation')
                            .equals(situation)
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const paramtitle = req.params.title 
            const query = Project.find({title: new RegExp(paramtitle, "i")})
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
            const parameters = ['name', 'registration', 'status', 'userType','profilePicture']
            const query = Project.find()
                            .sort({createdAt: -1}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({ advisor: id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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

    const getProjectsByAdvisorForTitle = async (req, res) => {
        try {
            const {id, title, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({title: new RegExp(title, "i")})
                            .where({advisor: id})
                            .sort({title:'asc'}) 
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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

    const getProjectsByAdvisorForSituation = async (req, res) => {
        try {
            const {advisorId, situation, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({situation: situation})
                .where({advisor: advisorId})
                .sort({title:'asc'}) 
                .populate('students', parameters)
                .populate('advisor', parameters)
                .populate('orientation')
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
            }

            const projects = await Project.paginate(query, options)
            existOrError(projects.docs, "Nenhum projeto encontrado")
            res.status(200).json(projects) 

        } catch (msg) {
            if(msg === "Nenhum projeto encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }     
        }
    }
    
    const getProjectsByAdvisorForTitleAndSituation = async (req, res) => {
        try {
            const {advisorId, title, situation, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({title: new RegExp(title, "i")})
                .and([{advisor: advisorId}, {situation: situation}])
                .sort({title:'asc'}) 
                .populate('students', parameters)
                .populate('advisor', parameters)
                .populate('orientation')
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
            }

            const projects = await Project.paginate(query, options)
            existOrError(projects.docs, "Nenhum projeto encontrado")
            res.status(200).json(projects) 

        } catch (msg) {
            if(msg === "Nenhum projeto encontrado") {
                res.status(400).send(msg)
            }else {
                res.status(500).send('Erro no servidor')
            }     
        }    
    } 

    const getProjectsForStudent = async (req, res) => {
        try {
            const id = req.params.id
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.find({ students: id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
                page: 1,
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

    const getProjectById = async (req, res) => {
        try {
            const {id, page} = req.params
            const parameters = ['name', 'registration', 'status', 'userType', 'profilePicture']
            const query = Project.findOne({ _id: id })
                            .populate('students', parameters)
                            .populate('advisor', parameters)
                            .populate('orientation')
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
    
        } catch (msg) {
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

            if(!studentOne && !studentTwo) {
                return res.status(400).json('Um projeto precisa ter pelo menos um aluno preenchido')
            }
                
            if(studentOne && !studentTwo) {
                await User.findByIdAndUpdate(project.students[0], { project: [], available: 'sim' })
                await User.findByIdAndUpdate(project.students[1], { project: [], available: 'sim' })

                project.students = [studentOne]
                await project.save()

                await User.findByIdAndUpdate(studentOne, { project: id, available: 'não' })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})
            }

            if(!studentOne && studentTwo) {
                await User.findByIdAndUpdate(project.students[0], { project: [], available: 'sim' })
                await User.findByIdAndUpdate(project.students[1], { project: [], available: 'sim' })

                project.students = [studentTwo]
                await project.save()

                await User.findByIdAndUpdate(studentTwo, { project: id, available: 'não' })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})
            }

            if(studentOne && studentTwo) {
                notEqualsOrError(studentOne, studentTwo, 'Não podem ser iguais')

                await User.findByIdAndUpdate(project.students[0], { project: [], available: 'sim' })
                await User.findByIdAndUpdate(project.students[1], { project: [], available: 'sim' })

                project.students = [studentOne, studentTwo] 
                await project.save()

                await User.findByIdAndUpdate(studentOne, { project: id, available: 'não' })
                await User.findByIdAndUpdate(studentTwo, { project: id, available: 'não' })
                
                res.status(200).json({project, Mensage: 'Projeto Atualizado com sucesso!'})

            } 
            
        } catch (msg) {
            res.status(400).json(msg)
        }
    }

    const updateProjectCoordinator = async (req, res) => {
        try {
            //pega as info do req
            const id = req.params.id
            const { advisor } = req.body

            //valida se não esta faltando o id do projeto e nem o id do prof 
            existOrError(id, 'Id não informado')
            existOrError(advisor, 'Professor orientador não informado')
            
            //vai ao banco e busca o projeto e o usuário antigo e o novo que iremos atualizar e
            const project = await Project.findOne({_id: id}).exec()
            const oldUser = await User.findOne({_id: project.advisor}).exec()
            const newUser = await User.findOne({_id: advisor}).exec()
            
            //checa se os usuários forem iguais não faz nada
            if(`${project.advisor}` === advisor) {
                return res.status(200).json({project, Mensage: 'Projeto atualizado com sucesso'})
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
                return res.status(200).json({project, Mensage: 'Projeto alterado com sucesso'})
            }
            
        } catch (msg) {
            res.status(400).json(msg)
        }   
    }

    const deleteProject = async (req, res) => {
        try {
            //peguei as informações
            const id = req.params.id
            const user = req.user

            //buscando o projeto no banco
            const deleteProject = await Project.findOne({_id: id})
            existOrError(deleteProject, 'Id do projeto incorreto ou não existe')

            //validando se o usuário possuí permissão para deletar
            equalsOrError(`${deleteProject.advisor}`, `${user._id}`, 'Usuário não tem permissão para deletar o projeto')

            /*Possuí permissão agora é hora de 
             * ir apagando as coisas */
            if(deleteProject.tasks.length !== 0) {
                deleteProject.tasks.forEach(item => {
                    Task.findOne({_id: item }).then(itemTask => {
                        //procura os comentários e os deleta
                        itemTask.comments.forEach(itemComment => {
                            Comment.findByIdAndRemove({_id: itemComment}).then()
                        })

                        //procura os arquivos salvos e deleta no bucket
                        if(itemTask.finalFile.key !== '') {
                            s3.deleteObject({
                                Bucket: process.env.AWS_STORAGE_TASK_DOCUMENT,
                                Key: itemTask.finalFile.key  
                            }).promise()
                        }

                        //apaga as tarefas no banco
                        itemTask.remove()
                    })
                })
            }

            //deletando as orientações
            if(deleteProject.orientation.length !== 0){
                deleteProject.orientation.forEach(itemOrientation => {
                    Orientation.findByIdAndRemove({_id: itemOrientation})
                })    
            }

            //altera o projeto para array zerado no documento do(s) aluno(s)
            deleteProject.students.forEach(itemStudent => {
                User.findByIdAndUpdate(itemStudent, {project: [], available: 'sim'}).then()
            })

            // //altera o projeto para array zerado no documento do professor
            // User.findByIdAndUpdate(deleteProject.advisor, {project: []}).then()
            user.project.splice(user.project.indexOf(deleteProject._id),1)
            await user.save()

            //deleta de vez o projeto
            deleteProject.remove()
            res.status(200).json({Mensage: 'Projeto Deletado com sucesso!'})
            
        } catch (msg) { 
            res.status(400).json(msg)
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
        getProjectsByAdvisorForTitle,
        getProjectsByAdvisorForSituation,
        getProjectsByAdvisorForTitleAndSituation,
        getProjectsForStudent,
        getProjectById,
        updateProject,
        updateProjectCoordinator,
        deleteProject           
    }
}