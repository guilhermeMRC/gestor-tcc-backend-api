module.exports = app => {
    const saveMenssage = {
        nameNotInformed: 'Nome não informado',
        registrationNotInformed: 'Matricula não informada',
        emailNotInformed: 'E-mail não informado',
        userTypeNotInformed: 'Tipo de usuário não informado',
        foundSameRegistration: 'Já possui um usuário cadastrado com essa matricula',
        foundSameEmail: 'Já possui um usuário cadastrado com esse e-mail',
        registeredSuccessfully: 'Usuário Cadastrado com sucesso',
        mailSent: 'Erro ao enviar e-mail, por favor verifique as permisões de e-mail',
        serverError: 'Erro interno'
    }

    return { saveMenssage }
}