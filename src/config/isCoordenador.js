module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.userType === "Coordenador") {
            middleware(req, res, next)
        }else {
            res.status(401).send('Usuário não é Coordenador.')
        }
    }
}