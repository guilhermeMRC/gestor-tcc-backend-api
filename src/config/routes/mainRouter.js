module.exports = app => {

    const { signin } = app.src.controler.auth
    
    const {
        forgotPassword,
        resetPassword      
    } = app.src.controler.user
    
    const routerDefault = async (req, res) => {
        res.status(200).send("Serviço funcionando")
    }

    //rota raiz
    app.get('/', routerDefault)

    //rota de login no sistema
    app.post('/login', signin)
    // app.post('/validateToken', app.src.controler.auth.validateToken)

    //rota esqueci minha senha
    app.post('/esqueci_minha_senha', forgotPassword)

    //rota para resetar senha
    app.post('/resetar_senha', resetPassword)
    
}