module.exports = app => {
    
    const User = app.mongoose.model('User', {
        name: {
            type: String,
            required: true
        },
        registration: {
            type: String,
            required: true,
            unique: true,
            maxlength: 12
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        status: Boolean,
        userType: {
            type: String,
            enum: ['Professor', 'Aluno', 'Administrativo']
        },
        isCoordinator: {
            type: Boolean,
            default: false
        },
        profilePicture: {
            type: String,
            default: ''
        },
        aboutProfile: {
            type: String, //ver se é o suficiente
            default: ''
        },
        available: {
            type: String,
            enum: ['sim', 'não', 'nulo'],
            default: 'nulo'
        },
        links: {
            type: [],
        },  
        tokenJwt: {
            type: String,
            default: "",
            select: false
        },
        passwordResetToken: {
            type: String,
            default: "",
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })

    return { User }
}