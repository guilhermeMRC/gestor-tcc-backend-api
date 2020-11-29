const { Schema } = require('mongoose');
const { Mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { format } = require('date-fns-tz');

module.exports = app => {
    const taskSchema = app.mongoose.Schema({
        title: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        // project: {
        //     type: app.mongoose.Schema.Types.ObjectId,
        //     ref: 'Project',
        //     require: true
        // },
        situation: {
            type: String,
            enum: ['concluído', 'atraso', 'iniciado', 'recusado'],
            default: 'iniciado'
        },
        initialDate: {
            type: String,
            require: true
        },
        deadLine: {
            type: String,
            require: true      
        },
        deliveryDate: {
            type: String,     
        },
        comments: [{
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        finalFile: {
            type: Object,
            default: {}
        },
        link: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    })
    
    taskSchema.plugin(mongoosePaginate)

    const Task = app.mongoose.model('Task', taskSchema)

    return { Task }
}