const path = require('path')
const { sign } = require('./../../lib/jwt')
const { login } = require('./model')

const GET = (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src', 'views', 'login.html'))
}

const POST = (req, res) => {
    console.log(req.body);
    login(req.body)
        .then((user) => {
            res.send({
                status: 200,
                token: sign({ id: user.user_id, username: user.username, avatar_link: user.avatar_link }), 
                message: "The user has registered successfully" 
            })
        })
        .catch((err) => {
            console.log(err);
            return res.send({ 
                status: 500, 
                message: "The user not found please register" 
            })
        })
}

module.exports = { GET, POST }