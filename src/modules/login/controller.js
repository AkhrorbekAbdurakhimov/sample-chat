const path = require('path')
const {sign} = require('./../../lib/jwt')
const {loginUser} = require('./model')

const GET = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'views', 'login.html'))
}

const POST = (req, res) => {
    let user = loginUser(req.body)
    if (user) {
        res.status(201).json({
            message: "The user has logged in",
            body: user,
            token: sign(user)
        })
    } else {
        res.status(401).json({message: "Wrong username or password"})
    }
}

module.exports = {GET, POST}