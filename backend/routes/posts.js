const express = require('express')
const Post = require('../service/db')
const router = express.Router()
const multer = require('multer')
const tokenMiddle = require('../middleware/token')
const logic = require('../logic/logic')
const cloudinary = require('../utils/cloudinary')
const upload = require('../middleware/multer')

// const MIME_TYPE_MAP = {
//     'image/png': 'png',
//     'image/jpeg': 'jpg',
//     'image/jpg': 'jpg'
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const isValid = MIME_TYPE_MAP[file.mimetype]
//         let error = new Error('Invalid Mime type')
//         if (isValid) {
//             error = null
//         }
//         cb(error, 'images')
//     },
//     filename: (req, file, cb) => {
//         const name = file.originalname.toLowerCase().split(' ').join('-')
//         const ext = MIME_TYPE_MAP[file.mimetype]
//         cb(null, name + '-' + Date.now() + '.' + ext)
//     }
// })

// all posts
router.get('', (req, res) => {
    Post.find()
        .then((documents) => {
            res.status(200).json({
                message: 'Post fetched successfully',
                posts: documents
            })
        })
})


// add post
router.post('', tokenMiddle, upload.single('image'), async (req, res) => {
    // console.log(req.file.path);
    // console.log(req.file.filename);
    cloudinary.uploader.upload(req.file.path, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: 'Error'
            })
        }
        // res.status(200).json({
        //     success: true,
        //     message: 'uploaded',
        //     data: result
        // })
        const user = await logic.getUser(req.userToken.userId)
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: result.url,
            creator: req.userToken.userId,
            name: user.other.username
        })
        post.save().then((createdPostId) => {
            res.status(201).json({
                message: 'post added successfully',
                post: {
                    id: createdPostId._id,
                    title: createdPostId.title,
                    content: createdPostId.content,
                    imagePath: createdPostId.imagePath,
                    creator: createdPostId.creator,
                    name: createdPostId.username
                }
            })
        })
    })
    // const url = req.protocol + '://' + req.get('host')
})

// update post
router.put('/:id', tokenMiddle, upload.single('image'), (req, res) => {
    console.log(req)
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: 'Error'
                })
            }
            const post = new Post({
                _id: req.body.id,
                title: req.body.title,
                content: req.body.content,
                imagePath: result.url
            })
            Post.updateOne({ _id: req.params.id, creator: req.userToken.userId }, post).then((result) => {
                if (result.modifiedCount > 0) {
                    console.log(result);
                    res.status(200).json({ message: 'Post Updated successfull' })
                } else {
                    console.log(Error);
                    res.status(401).json({ message: 'Unauthorized user' })
                }
            }).catch((err) => {
                console.log(err);
            })
        })
    } else {
        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath: req.body.imagePath
        })
        Post.updateOne({ _id: req.params.id, creator: req.userToken.userId }, post).then((result) => {
            if (result.modifiedCount > 0) {
                // console.log(result);
                res.status(200).json({ message: 'Post Updated successfull' })
            } else {
                // console.log(Error);
                res.status(401).json({ message: 'Unauthorized user' })
            }
        }).catch((err) => {
            console.log(err);
        })
    }
})

// get post(edit reload)
router.get('/:id', (req, res) => {
    Post.findById(req.params.id).then(post => {
        if (post) {
            res.status(200).json(post)
        } else {
            res.status(404).json({ message: 'Post not found' })
        }
    }).catch((err) => {
        console.log(err);
    })
})

// delete post
router.delete('/:id', tokenMiddle, (req, res) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userToken.userId })
        .then((result) => {
            if (result.deletedCount > 0) {
                res.status(201).json({ message: 'Deletion successfull' })
            } else {
                res.status(401).json({ message: 'Unauthorized user' })
            }
        })
        .catch((err) => {
            console.log(err);
        })
})

// get profile posts
router.get('/profile/:name', (req, res) => {
    logic.getProfPost(req.params.name).then(result => {
        // console.log(result);
        res.status(200).json(result)
    }).catch(err => {
        res.status(403).json(err)
    })
})

module.exports = router