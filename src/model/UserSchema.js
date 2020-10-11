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
        researchLine: String,
        userType: {
            type: String,
            enum: ['Coordenador', 'Professor', 'Aluno', 'Administrativo']
        },
        availability: {
            type: String,
            enum: ['sim', 'não']
        },
        passwordResetToken: {
            type: "String",
            default: "",
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        }
    })

    return { User }
}