const path = require('path')
const { fetch } = require('./../../lib/postgres')

const LoginUser = `
    select 
        user_id,
        username, 
        avatar_link
    from users
    where username = $1 and password = $2;
`

const login = ({ username, password }) => fetch(LoginUser, username, password)

module.exports = { login }