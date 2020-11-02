const { Schema } = require('mongoose');
const { Mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); 
const moment = require('moment')
module.exports = app => {
    // defino o Schema
    const documentationSchema = app.mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        documentIformation: {
            type: Object
        },
        createdAt: {
            type: Date,
            default: moment().format()
        }
    })
    
    documentationSchema.plugin(mongoosePaginate)

    const Documentation = app.mongoose.model('Documentation', documentationSchema)

    return { Documentation }
}