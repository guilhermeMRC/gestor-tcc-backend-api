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

    function formatEmailSaveUser(registration) {
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
            <p>Estamos te informando seu login e senha no sistema</p>
            <p>Matrícula: ${registration}</p>
            <p>Senha: ${registration}</p>
            <p>Ao se logar pela primeira vez, recomendamos, por medidas de segurança que o senhor efetue a troca de sua senha</p>
            <p>Caso queira se logar no sistema, segue o link abaixo </p>
            <a href="https://gestor-tcc-frontend-react.vercel.app/login">click aqui</a>
        </body>
        </html>`
        
        return template    
    }

    return { formatEmail, formatEmailSaveUser }
}