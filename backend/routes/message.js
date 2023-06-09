const express = require('express')
const router = express.Router()
const Message = require('../service/message')

// add msg
router.post('/', async (req, res) => {
    const newMessage = new Message(req.body)
    try {
        const savedMessage = await newMessage.save()
        res.status(200).json(savedMessage)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get msgs
router.get('/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router