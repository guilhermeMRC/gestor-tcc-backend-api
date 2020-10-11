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

    return { formatEmail }
}