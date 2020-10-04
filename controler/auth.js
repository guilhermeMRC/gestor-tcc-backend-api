const  jwt = require('jwt-simple')
const bcrypt = require('bcrypt')

module.exports = app => {
    //model para fazer consultas
    const User = app.model.UserSchema.User
    
    const secret = process.env.AUTH_SECRET

    const signin = async (req, res) => {
        
        //verifica se usuário digitou matricula e senha
        //caso não, envia uma mensagem de erro
        if(!req.body.registration || !req.body.password) {
            return res.status(400).send('Informe matricula e senha!')
        }
        
        //usuário digitou matricula e senha. 
        //Vai até o banco e procura esse usuário.
        //pelo método findOne que retorna um objeto 
        const user = await User.findOne({ registration: req.body.registration }).exec()
        
        //caso não ache o usuário ainda não foi cadastrado
        if(!user){
            return res.status(400).send('Usuário não encontrado!')
        }

        //compara as duas senhas. 
        //Se a senha não conferir manda uma mensagem 
        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if(!isMatch){
            return res.status(401).send('Email/Senha inválidos')
        } 

        //---passado isso tudo é hora de gerar o token--

        //capturando a data atual em milissegundos
        const momentNow = Math.floor(Date.now() / 1000)

        //criando meu payload
        //*vou passar mais paramentros como 
        //*se ele é coordenador/professor/aluno
        const payload = {
            id: user.id,
            name: user.name,
            registration: user.registration,
            iat: momentNow,
            exp: momentNow + (60 * 60)
        }

        res.json({
            ...payload,
            token: jwt.encode(payload, secret)
        })

        
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null 
        try {
            if(userData) {
                const token = jwt.decode(userData.toke, secret)
                if(new Date(toke.exp * 1000) > new Date()) {
                    return res.send(true)    
                }
            }
        }catch(e) {

        }
        
        res.send(false)
    }

    return { signin, validateToken}
}