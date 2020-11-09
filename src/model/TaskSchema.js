const { Schema } = require('mongoose');
const { Mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const moment = require('moment') 
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
        inicialDate: {
            type: Date,
            default: moment().format(),
        },
        deadline: {
            type: Date,
            require: true      
        },
        deliveryDate: {
            type: Date,
            require: true       
        },
        note: [{
            type: Object
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })
    
    taskSchema.plugin(mongoosePaginate)

    const Task = app.mongoose.model('Task', taskSchema)

    return { Task }
}