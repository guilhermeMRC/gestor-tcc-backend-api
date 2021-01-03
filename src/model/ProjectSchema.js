const { Schema } = require('mongoose');
const { Mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); 
module.exports = app => {
    const projectSchema = app.mongoose.Schema({
        title: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        students: [{
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        }],
        advisor: {
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        tasks: [{
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }],
        orientation: [{
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'Orientation'
        }],
        situation: {
            type: String,
            enum: ['concluído', 'pré-tcc', 'tcc1', 'tcc2'],
            default: 'pré-tcc'
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })
    
    projectSchema.plugin(mongoosePaginate)

    const Project = app.mongoose.model('Project', projectSchema)

    return { Project }
}