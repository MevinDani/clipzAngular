const express = require('express')
const router = express.Router()
const Conversation = require('../service/conversation')

// new conv
router.post('/', async (req, res) => {
    // console.log(req.body.senderId, req.body.receiverId);
    const conversation = await Conversation.findOne({
        participants: { $all: [req.body.senderId, req.body.receiverId] }
    });
    if (conversation) {
        // console.log('cid exist');
        return res.status(200).json(conversation)
    }
    const newConversation = new Conversation({
        participants: [req.body.senderId, req.body.receiverId]
    })
    try {
        const savedConversation = await newConversation.save()
        // console.log('cid new');
        res.status(200).json(savedConversation)
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})

// get conv of a user
router.get('/:userId', async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] }
        })
        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router

