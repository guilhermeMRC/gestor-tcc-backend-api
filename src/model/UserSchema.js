const { Schema } = require('mongoose');
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
            type: Object,
            default: {
                cod: '',
                namePicture: '',
                size: 0,
                key: '',
                url: '',
            }
        },
        aboutProfile: {
            type: String, //ver se é o suficiente
            default: ''
        },
        researchLine: {
            type: String,
            default: ''
        },
        available: {
            type: String,
            enum: ['sim', 'não', 'nulo'],
            default: 'nulo'
        },
        links: {
            type: Object,
            default: {
                facebook: '',
                linkedin: '',
                youtube: '',
                instagram: '',
                lattes: '',
            }
        },
        phoneNumber: {
            type: Object,
            default: {
                primaryNumber: '',
                secondNumber: '',
            }
        },
        secondaryEmail: {
            type: String,
            default: ''
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
        project: [{
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })
    
    userSchema.plugin(mongoosePaginate)

    const User = app.mongoose.model('User', userSchema)

    return { User }
}