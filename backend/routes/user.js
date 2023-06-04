const express = require('express')
const User = require('../service/userDb')
// const bcrypt = require('bcrypt')
const logic = require('../logic/logic')
const { route } = require('./posts')
const router = express.Router()

router.post('/signup', (req, res) => {
    logic.register(req.body.username, req.body.password).then(result => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(401).json(err)
    })
})

router.post('/login', (req, res) => {
    logic.login(req.body.username, req.body.password).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(401).json(err)
    })
})

router.get('/profile/:name', (req, res) => {
    logic.getUserN(req.params.name).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(403).json({
            message: 'Username donot exists',
        })
    })
})

router.get('/:id', (req, res) => {
    logic.getUser(req.params.id).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(403).json({
            message: 'UserId donot exists'
        })
    })
})

router.put('/follow/:id', (req, res) => {
    logic.followUser(req.params.id, req.body.id).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(403).json({
            message: 'UserId (follow) donot exists'
        })
    })
})

router.get('/followersList/:id', (req, res) => {
    logic.followerList(req.params.id).then(result => {
        res.status(200).json(result)
    }).catch(err => {
        res.status(401).json({
            message: 'UserId donot exists'
        })
    })
})


module.exports = router
