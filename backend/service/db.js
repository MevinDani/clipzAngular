const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, ref: 'User', required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', commentSchema);

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imagePath: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, ref: 'User', required: true },
    likes: { type: Array, default: [] },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
})

const Post = mongoose.model('Post', postSchema)

module.exports = {
    Post,
    Comment
}