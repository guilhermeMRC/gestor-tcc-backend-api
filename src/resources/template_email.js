module.exports = app => {
    function formatEmail(token) {
        const template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teamplate</title>
        </head>
        <body>
            <h1>Olá</h1>
            <p>Estamos te enviando um link para recuperação de senha</p>
            <a href="https://gestor-tcc-frontend-react.vercel.app/reset_password/${token}">click aqui</a>
        </body>
        </html>`
        
        return template
    }

    function formatEmailSaveUser(registration, password) {
        const template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teamplate</title>
        </head>
        <body>
            <h1>Seja Bem vindo ao Sistema Gerenciador de TCC do Curso de Sistemas IFF - Itaperuna-RJ</h1>
            <p>Parabéns você foi cadastrado com sucesso no sistema!</p>
            <p>Estamos te informando seu login e senha.</p>
            <p>Matrícula: ${registration}</p>
            <p>Senha: ${password}</p>
            <p>Caso queira efetuar a troca de sua senha, por favor acesse esse link</p>
            <a href="https://gestor-tcc-frontend-react.vercel.app/forgot_password">click aqui</a>
            <p>Caso queira se logar no sistema com a senha enviada, segue o link abaixo </p>
            <a href="https://gestor-tcc-frontend-react.vercel.app/login">click aqui</a>
        </body>
        </html>`
        
        return template    
    }

    function formatNotificationSaveTask(newTask) {
        const template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teamplate</title>
        </head>
        <body>
            <h1>NOTIFICAÇÃO!</h1>
            <p>Olá. Seu professor acabou de postar a tarefa "${newTask}" no SGTCC.</p>
            <p>Acesse a plataforma para conferir.</p>
        </body>
        </html>`
        
        return template    
    }

    function formatNotificationDeliveryTask(taskTitle, students, projectTitle) {
        const template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Teamplate</title>
        </head>
        <body>
            <h1>NOTIFICAÇÃO!</h1>
            <p>Olá. O(s) aluno(s) ${students} do TCC "${projectTitle}" entregaram a Tarefa "${taskTitle}".</p>
            <p>Acesse a plataforma para conferir.</p>
        </body>
        </html>`
        
        return template    
    }

    return { 
        formatEmail, 
        formatEmailSaveUser, 
        formatNotificationSaveTask, 
        formatNotificationDeliveryTask 
    }
}