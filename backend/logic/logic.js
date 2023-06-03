const User = require('../service/userDb')
const Post = require('../service/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


register = async (username, password) => {
    const user = await User.findOne({ username })
    if (user) {
        return {
            message: 'User with same username already exists'
        }
    } else {
        const hashPsw = await bcrypt.hash(password, 10)
        const newUser = new User({
            username: username,
            password: hashPsw
        })
        await newUser.save()
        return {
            message: 'User successfully created',
            result: newUser
        }
    }
}

login = async (username, password) => {
    const user = await User.findOne({ username })
    if (!user) {
        return {
            message: 'User not found'
        }
    } else {
        const validPasswd = await bcrypt.compare(password, user.password)
        if (validPasswd) {
            const token = jwt.sign({ userId: user._id }, 'secretKey')
            return {
                message: 'Successfull Login',
                result: user,
                token
            }
        } else {
            return {
                message: 'Incorrect Credentials'
            }
        }
    }
}

getUser = async (id) => {
    const user = await User.findOne({ _id: id })
    if (user) {
        const { password, ...other } = user._doc
        return {
            other
        }
    } else {
        return {
            message: 'User donot exists'
        }
    }
}

getUserN = async (name) => {
    const user = await User.findOne({ username: name })
    if (user) {
        const { password, ...other } = user._doc
        return {
            other
        }
    } else {
        return {
            message: 'User donot exists'
        }
    }
}

getProfPost = async (name) => {
    const post = await Post.find({ name })
    if (post) {
        return post
    } else {
        return {
            message: 'Post donot exists'
        }
    }
}

module.exports = { register, login, getUser, getUserN, getProfPost }