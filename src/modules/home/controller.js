const path = require('path')
const { verify } = require('./../../lib/jwt')
const uniqueId = require('./../../lib/mhid')
const { message, getUsers, getMessages } = require('./model')

const GET = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'views', 'index.html'))
}

const POST = (req, res) => {
    try {
        let { id } = verify(req.headers.token)
        if (!req.files) {
            message(id, req.body.message, null)
                .then(() => {
                    res.send({
                        message: "The message has sent successfully",
                        body: message
                    })
                })
                .catch((err) => {
                    return res.send({ 
                        status: 500, 
                        message: "Internal server error" 
                    })
                })
        } else {
            let file = req.files.file
            let fileName = uniqueId(5) + file.name.replace(/\s/g, "_").trim()
            file.mv(path.join(process.cwd(), 'src', 'uploads', 'files', fileName), (err) => {
                if (err) console.log(err)
            })

            message(id, null, fileName)
                .then(() => {
                    res.send({
                        message: "The message has sent successfully",
                        body: message
                    })
                })
                .catch((err) => {
                    return res.send({ 
                        status: 500, 
                        message: "Internal server error" 
                    })
                })
        }
    } catch (err) {
        return res.send({
            status: 400,
            message: "Bad request",
            error: err
        })
    }
}

const USERS = (req, res) => {
    let currentUser = verify(req.headers.token)
    try {
        getUsers()
            .then((users) => {
                res.send({
                    status: 200,
                    users,
                    currentUser
                })
            })
            .catch((err) => {
                return res.send({ 
                    status: 500, 
                    message: "Internal server error" 
                })
            })
    } catch (err) {
        return res.send({
            status: 400,
            message: "Bad request",
            error: err
        })
    } 
}

const MESSAGES = (req, res) => {
    let currentUser = verify(req.headers.token)
    try {
        getMessages()
            .then((messages) => {
                res.send({
                    status: 200,
                    messages,
                    currentUser
                })
            })
            .catch((err) => {
                return res.send({ 
                    status: 500, 
                    message: "Internal server error" 
                })
            })
    } catch (err) {
        return res.send({
            status: 400,
            message: "Bad request",
            error: err
        })
    } 
}

module.exports = { GET, POST, USERS, MESSAGES }