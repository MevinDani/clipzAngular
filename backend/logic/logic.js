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
    console.log(id);
    const user = await User.findOne({ _id: id })
    console.log(user);
    if (user) {
        const { password, ...other } = user._doc
        console.log(other);
        return {
            other
        }
    } else {
        return {
            message: 'UserId donot exists'
        }
    }
}

getUserN = async (name) => {
    console.log(name);
    const user = await User.findOne({ username: name })
    console.log(user);
    if (user) {
        const { password, ...other } = user._doc
        return {
            other
        }
    } else {
        return {
            message: 'UserName donot exists'
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

followUser = async (reqId, putId) => {
    // console.log(reqId, putId);
    if (reqId !== putId) {
        const logUser = await User.findOne({ _id: putId })
        const toFollowUser = await User.findOne({ _id: reqId })
        // console.log(logUser, toFollowUser);
        if (!toFollowUser.followers.includes(putId)) {
            await toFollowUser.updateOne({ $push: { followers: putId } })
            await logUser.updateOne({ $push: { followings: reqId } })
            return {
                message: 'User has been followed'
            }
        } else {
            return {
                message: 'You already follow this user'
            }
        }
    } else {
        return {
            message: 'You cant follow yourself'
        }
    }
}

followerList = async (id) => {
    const user = await User.findOne({ _id: id })
    // console.log(user);
    if (user) {
        const { followings } = user._doc
        // console.log([other]);
        return followings
    } else {
        return {
            message: 'follower error'
        }
    }
}

module.exports = { register, login, getUser, getUserN, getProfPost, followUser, followerList }