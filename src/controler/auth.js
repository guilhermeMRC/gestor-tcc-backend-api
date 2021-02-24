const  jwt = require('jwt-simple')


module.exports = app => {
    //model para fazer consultas
    const User = app.src.model.UserSchema.User

    //importando funções de validação
    const { existOrError, notExistsOrError, equalsOrError, isNumeric } = app.src.controler.validation
    
    //palavra chave para criar jwt
    const secret = process.env.AUTH_SECRET

    //função que compara as senhas criptografadas
    const { comparePassword } = app.src.config.bcrypt

    const signin = async (req, res) => {
        
        try {
            
            existOrError(req.body.registration, 'Matrícula não informada!')
            existOrError(req.body.password, 'Senha não informada!')

            const user = await User.findOne({ registration: req.body.registration }).exec()
            
            existOrError(user, 'Usuário não encontrado!')
    
            equalsOrError(user.status, 'ativo', 'Usuário está inativo. Por favor entre em contato com a coordenação de ensino.')
            
            // comparePassword(res, req.body.password, user.password)
            if(comparePassword(req.body.password, user.password) === false){
                return res.status(401).json('Senha inválida')
            }

            //capturando a data atual em milissegundos
            const momentNow = Math.floor(Date.now() / 1000)
    
            //criando meu payload
            const payload = {
                id: user.id,
                name: user.name,
                registration: user.registration,
                email: user.email,
                userType: user.userType,
                isCoordinator: user.isCoordinator,
                available: user.available,
                iat: momentNow,
                exp: momentNow + (72 * 60 * 60)
            }
            
            //criando o token
            const tokenJWT = jwt.encode(payload, secret)

            //validando o token
            if(!validateToken(tokenJWT)) {
                return res.status(400).send("Token inválido")
            }
            
            //salvando o token no banco de dados
            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    tokenJwt: tokenJWT,
                },
            }).select("+tokenJwt");
    
            res.status(200).json({
                ...payload,
                token: tokenJWT
            })
    
        }catch(msg) {
            return res.status(400).json(msg)
        }  
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