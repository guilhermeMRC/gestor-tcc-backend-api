module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.isCoordinator || req.user.userType === 'Administrativo') {
            middleware(req, res, next)
        }else {
            res.status(401).send('Usuário não é Coordenador ou Administrador.')
        }
    }
}