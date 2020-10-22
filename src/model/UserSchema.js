const { Mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); 
module.exports = app => {
    // defino o Schema
    const userSchema = app.mongoose.Schema({
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
        status: {
            type: String,
            enum: ['ativo', 'inativo']
        },
        userType: {
            type: String,
            enum: ['professor', 'aluno', 'administrativo']
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
    
    userSchema.plugin(mongoosePaginate)

    const User = app.mongoose.model('User', userSchema)

    return { User }
}