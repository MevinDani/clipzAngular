const express = require('express')
const { Post, Comment } = require('../service/db')
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
    Post.find().sort({ lastUpdated: -1 })
        .then((documents) => {
            // console.log(documents)
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
        // console.log(user);
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: result.url,
            creator: req.userToken.userId,
            name: user.username,
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
router.put('/:id', tokenMiddle, upload.single('image'), async (req, res) => {
    // console.log(req)
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: 'Error'
                })
            }
            const oldPostDetails = await Post.findById(req.body.id)
            oldPostDetails.title = req.body.title
            oldPostDetails.content = req.body.content
            oldPostDetails.imagePath = result.url
            oldPostDetails.likes = oldPostDetails.likes
            oldPostDetails.comments = oldPostDetails.comments

            await oldPostDetails.save()
                .then((result) => {
                    // console.log(result);
                    res.status(200).json({ message: 'Post updated successfully' });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({ message: 'An error occurred while updating the post' });
                });
        })
    } else {
        const oldPostDetails = await Post.findById(req.body.id)
        oldPostDetails.title = req.body.title
        oldPostDetails.content = req.body.content
        oldPostDetails.imagePath = req.body.imagePath
        oldPostDetails.likes = oldPostDetails.likes
        oldPostDetails.comments = oldPostDetails.comments

        await oldPostDetails.save()
            .then((result) => {
                // console.log(result);
                res.status(200).json({ message: 'Post updated successfully' });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).json({ message: 'An error occurred while updating the post' });
            });

        // await Post.updateOne({ _id: req.params.id, creator: req.userToken.userId }, post).then((result) => {
        //     if (result.modifiedCount > 0) {
        //         // console.log(result);
        //         res.status(200).json({ message: 'Post Updated successfull' })
        //     } else {
        //         console.log(Error);
        //         res.status(401).json({ message: 'Unauthorized user' })
        //     }
        // }).catch((err) => {
        //     console.log(err);
        // })
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
router.get('/profile/:id', (req, res) => {
    logic.getProfPost(req.params.id).then(result => {
        console.log(result);
        res.status(200).json(result)
    }).catch(err => {
        console.log(err);
        res.status(403).json(err)
    })
})

// like a post
router.put('/post/like/:id', (req, res) => {
    logic.likePost(req.params.id, req.body.id).then((result) => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })
})

// dislike a post
router.put('/post/dislike/:id', (req, res) => {
    logic.dislikePost(req.params.id, req.body.id).then((result) => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })
})

// get Liked Posts
router.get('/likedPosts/:id', (req, res) => {
    logic.getlikedPost(req.params.id).then((result) => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })
})

// get followings post
router.get('/followersPost/:id', (req, res) => {
    logic.getFollowingsPost(req.params.id).then((result) => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json(err)
    })
})

// add comments
router.post('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params
        const { content, userId, name } = req.body

        const comment = new Comment({
            content,
            postId,
            userId,
            name
        })
        await comment.save()

        const post = await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } }, { new: true })
        res.status(201).json({ message: 'Comment added successfully', comment, post });
    } catch (error) {
        console.error('Failed to add comment', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
})

// retrieve comments of a post
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params
        const post = await Post.findById(postId).populate('comments')
        const comments = post.comments

        res.status(200).json(comments)
    } catch (error) {
        console.error('Failed to retrieve comments', error);
        res.status(500).json({ error: 'Failed to retrieve comments' });
    }
})

// get latest cmts of a post
router.get('/:postId/comments/latest', async (req, res) => {
    try {
        const { postId } = req.params
        const post = await Post.findById(postId)
            .populate({
                path: 'comments',
                options: {
                    sort: { _id: -1 } // Sort comments in descending order based on _id
                }
            });
        const comments = post.comments
        res.status(200).json(comments)
    } catch (error) {
        console.error('Failed to retrieve latest comments', error);
        res.status(500).json({ error: 'Failed to retrieve latest comments' });
    }
})

// delete a comment from post
router.delete('/:postId/comments/:cmntId', async (req, res) => {
    const { postId, cmntId } = req.params
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { comments: cmntId } },
            { new: true }
        )
        await Comment.findByIdAndRemove(cmntId)
        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Error deleting comment" });
    }
})

module.exports = router