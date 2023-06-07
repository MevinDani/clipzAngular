const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    about: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    followersName: { type: Array, default: [] },
    followingsName: { type: Array, default: [] }
})

module.exports = mongoose.model('User', userSchema)