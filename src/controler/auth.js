const  jwt = require('jwt-simple')


module.exports = app => {
    //model para fazer consultas
    const User = app.src.model.UserSchema.User
    
    //palavra chave para criar jwt
    const secret = process.env.AUTH_SECRET

    //função que compara as senhas criptografadas
    const { comparePassword } = app.src.config.bcrypt

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

        if(!user.status) {
            return res.status(400).json({mensagem: 'Usuário está inativo. Por favor entre em contato com a coordenação de ensino.'})
        }
        //compara as duas senhas. 
        //Se a senha não conferir manda uma mensagem 
        comparePassword(res, req.body.password, user.password)

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
            email: user.email,
            userType: user.userType,
            iat: momentNow,
            exp: momentNow + (60 * 60)
        }

        //validando o token
        const tokenJWT = jwt.encode(payload, secret)
        if(!validateToken(tokenJWT)) {
            res.status(400).send("Token inválido")
        }
        
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                tokenJwt: tokenJWT,
            },
        }).select("+tokenJwt");

        res.json({
            ...payload,
            token: tokenJWT
        })

        
    }

    function validateToken(tokenJWT) {
        const userData = tokenJWT || null
        try {
            if(userData) {
                const tokenDecode = jwt.decode(userData, secret)
                if(new Date(tokenDecode.exp * 1000) > new Date()) {
                    return true    
                }
            }
        }catch(e) {
            return false
        }
                  
    } 

    // const validateToken = async (req, res) => {
    //     const userData = req.body || null 
    //     try {
    //         if(userData) {
    //             const token = jwt.decode(userData.token, secret)
    //             if(new Date(token.exp * 1000) > new Date()) {
    //                 return res.send("Token válido!")    
    //             }
    //         }
    //     }catch(e) {

    //     }
        
    //     res.send(false)
    // }

    return { signin }
}