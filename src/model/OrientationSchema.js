const mongoosePaginate = require('mongoose-paginate-v2'); 
module.exports = app => {
    const orientationSchema = app.mongoose.Schema({
        title: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        advisor: {
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        project: {
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            require: true
        },
        dateOrientation: {
            type: Date,
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })
    
    orientationSchema.plugin(mongoosePaginate)

    const Orientation = app.mongoose.model('Orientation', orientationSchema)

    return { Orientation }
}