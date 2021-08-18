const { fetch, fetchAll } = require('./../../lib/postgres')

const Message = `
    insert into messages (
        user_id,
        message,
        file_url 
    ) values (
        $1, $2, $3
    ) returning message_id;
`

const GetUser = `
    select 
        *
    from users
    where user_id = $1;
`

const GetUsers = `
    select 
        *
    from users;
`

const message = (id, message, file_url) => fetch(Message, id, message, file_url)
const getUser = (id) => fetch(GetUser, id)
const getUsers = () => fetchAll(GetUsers)

module.exports = { message, getUser, getUsers }