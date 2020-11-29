const mongoosePaginate = require('mongoose-paginate-v2'); 
module.exports = app => {
    const commentSchema = app.mongoose.Schema({
        commentUser: {
            type: app.mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: {
            type: String,
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    })
    
    commentSchema.plugin(mongoosePaginate)

    const Comment = app.mongoose.model('Comment', commentSchema)

    return { Comment }
}