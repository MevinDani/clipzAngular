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
    // console.log(id);
    const user = await User.findOne({ _id: id })
    // console.log(user);
    if (user) {
        const { password, ...other } = user._doc
        // console.log(other);
        return other
    } else {
        return {
            message: 'UserId donot exists'
        }
    }
}

getUserN = async (name) => {
    // console.log(name);
    const user = await User.findOne({ username: name })
    // console.log(user);
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

getProfPost = async (id) => {
    const post = await Post.find({ creator: id }).sort({ _id: -1 }).limit(100)
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
        // console.log(logUser, toFollowUser.username);
        if (!toFollowUser.followers.includes(putId)) {
            await toFollowUser.updateOne({ $push: { followers: putId } })
            await toFollowUser.updateOne({ $push: { followersName: logUser.username } })
            await logUser.updateOne({ $push: { followings: reqId } })
            await logUser.updateOne({ $push: { followingsName: toFollowUser.username } })
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

unfollowUser = async (reqId, putId) => {
    if (reqId !== putId) {
        const logUser = await User.findOne({ _id: putId })
        const unFollowUser = await User.findOne({ _id: reqId })
        // console.log(logUser, toFollowUser);
        if (unFollowUser.followers.includes(putId)) {
            await unFollowUser.updateOne({ $pull: { followers: putId } })
            await unFollowUser.updateOne({ $pull: { followersName: logUser.username } })
            await logUser.updateOne({ $pull: { followings: reqId } })
            await logUser.updateOne({ $pull: { followingsName: unFollowUser.username } })
            return {
                message: 'User has been unfollowed'
            }
        } else {
            return {
                message: 'You dont follow this user'
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

getProfilePics = async (username) => {
    const user = await User.findOne({ username })
    if (user) {
        const { profilePic } = user._doc
        return profilePic
    } else {
        return {
            message: 'Some error retreiving profile pics'
        }
    }
}

likePost = async (postId, userId) => {
    try {
        const post = await Post.findOne({ _id: postId })
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            return {
                message: 'Post has been liked'
            }
        }
    } catch (error) {
        return error
    }
}

// dislike a post
dislikePost = async (postId, userId) => {
    try {
        const post = await Post.findOne({ _id: postId })
        if (post.likes.includes(userId)) {
            await post.updateOne({ $pull: { likes: userId } })
            return {
                message: 'Like has been removed'
            }
        }
    } catch (error) {
        return error
    }
}

// get liked post
getlikedPost = async (id) => {
    try {
        const likedPosts = await Post.find({ likes: id }).sort({ _id: -1 })
        // console.log(likedPosts);
        if (likedPosts) {
            return likedPosts
        }
    } catch (error) {
        return error
    }
}

// get Followings Post
getFollowingsPost = async (id) => {
    try {
        const user = await User.findOne({ _id: id })
        if (user) {
            let followingPost = []
            let userFollowings = []
            userFollowings = [...user.followings]
            // console.log(userFollowings);
            const posts = await Post.find()
            posts.map(p => {
                userFollowings.map(u => {
                    if (u == p.creator) {
                        followingPost.push(p)
                    }
                })
            })
            // console.log(followingPost);
            return followingPost
        }
    } catch (error) {
        return error
    }
}


module.exports = { getFollowingsPost, getlikedPost, dislikePost, likePost, getProfilePics, register, login, getUser, getUserN, getProfPost, followUser, followerList, unfollowUser }