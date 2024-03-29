module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.isCoordinator || req.user.userType === 'administrativo') {
            middleware(req, res, next)
        }else {
            res.status(401).send('Usuário não é Coordenador ou Administrativo.')
        }
    }
}