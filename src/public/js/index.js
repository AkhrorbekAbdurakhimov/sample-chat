const socket = io()
let token = window.localStorage.getItem('token')
if (!token) window.location = '/login'
if (token) {
    token = JSON.parse(token)
}

socket.emit('user joined', {token})

const profileAvatar = document.querySelector('.profile-avatar'),
    profileName     = document.querySelector('.profile-name'),
    chatsList       = document.querySelector('.chats-list'),
    chatMain        = document.querySelector('.chat-main'),
    topNav          = document.querySelector('.top-nav'),
    chatFooter      = document.querySelector('.chat-footer'),
    chatFooterRoom  = document.querySelector('.chat-footer-room'),
    chatTitle       = document.querySelector('.chat-title'),
    form            = document.querySelector('.chat-footer'),
    textInput       = document.querySelector('#textInput'),
    textInputRoom   = document.querySelector('#textInputRoom'),
    uploadInput     = document.querySelector('#uploads'),
    uploadedFiles   = document.querySelector('.uploaded-file'),
    onlineUsers     = document.querySelector('.online-users')

async function groupMembersRender() {
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        }
    })
    let data = await response.json()
    let string = ""
    data.users.map(user => {
        if (user.user_id == data.currentUser.id) {
            profileAvatar.src = `images/${user.avatar_link}`
            profileName.textContent = user.username
            profileName.dataset.id = data.currentUser.id
        }
        string += `
            <li class="chats-item">
                <img src=${'images/' + user.avatar_link} alt="profile-picture" />
                <div class="wrapper">
                    <p>${user.username}</p>
                </div>
            </li>
        `
    })
    chatsList.innerHTML = string
}
async function messagesRenderer() {
    chatMain.innerHTML = null
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/messages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        }
    })
    let data = await response.json()
    let string = ""
    let str = ""
    data.messages.map(message => {
        if (message.message) {
            string += `
                <div class="msg-wrapper ${(message.user_id == data.currentUser.id) ? "msg-from" : ""}">
                    <img src=${'images/' + message.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${message.username}</p>
                        <p class="msg">${message.message}</p>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
        }
        if (message.file_url) {
            string += `
                <div class="msg-wrapper ${(message.user_id == data.currentUser.id) ? "msg-from" : ""}">
                    <img src=${'images/' + message.avatar_link} alt="profile-picture" />
                    <div class="msg-text">
                        <p class="msg-author">${message.username}</p>
                        <object data=${'files/' + message.file_url} class="msg object-class"></object>
                        <a href="/downloads?fileName=${message.file_url}">
                            <img src="./img/download.png" width="25px" />
                        </a>
                        <p class="time">${message.time}</p>
                    </div>
                </div>
            `
            str += `
                <li class="uploaded-file-item">
                    <a href="${'files/' + message.file_url}">
                        <img src="./img/file.png" alt="file" width="30px">
                        <p>${message.file_url.length > 25 ? message.file_url.slice(5, 25) + '...' +  message.file_url.slice(message.file_url.length - 5, message.file_url.length) : message.file_url.slice(5, message.file_url.length)}</p>
                    </a>
                </li>
            `
        }
    })
    chatMain.innerHTML = string
    uploadedFiles.innerHTML = str
}

messagesRenderer()

form.onsubmit = async (event) => {
    event.preventDefault()
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''
    let response = await fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({
            message: textInput.value
        })
    })
    response = await response.json()
    textInput.value = null
    messagesRenderer()
    socket.emit('watch')
}

socket.on('show', () => {
    messagesRenderer()
})

uploadInput.onchange = async (event) => {
    event.preventDefault()
    let token = window.localStorage.getItem('token')
    token = token ? JSON.parse(token) : ''

    let formData = new FormData()
    formData.append('file', uploadInput.files[0])
    let response = await fetch('/', {
        method: 'POST',
        headers: {
            'token': token
        },
        body: formData
    })
    response = await response.json()
    textInput.value = null
    messagesRenderer()
    socket.emit('watch')
}

let selectedUser
function usersRenderer (users) {
    let string = ""
    users.map(user => {
        if (user.username != profileName.textContent)
            string += `
                <li class="chats-item" data-id="${user.id}">
                    <img src=${'images/' + user.avatar_link} alt="profile-picture" />
                    <div class="wrapper">
                        <p>${user.username}</p>
                        <span class="online hide"><span class="text">typing</span><span class="dot"></span></span>
                    </div>
                </li>
            `
    })
    onlineUsers.innerHTML = string
    let rooms = document.querySelectorAll('.chats-item')
    rooms.forEach((room) => {
        room.onclick = () => {
            topNav.classList.remove('active')
            rooms.forEach((room) => {
                room.classList.remove('active')
            })
            room.classList.add('active')
            chatTitle.textContent = room.childNodes[3].childNodes[1].textContent
            chatFooter.classList.add('hide')
            chatFooterRoom.classList.remove('hide')
            chatMain.innerHTML = null
            selectedUser = room
            const typingStatus = document.querySelector('.online')
            socket.on('typing', () => {
            typingStatus.classList.remove('hide')
    })
    socket.on('stopping', () => {
        typingStatus.classList.add('hide')
	})
        }
    })
    topNav.onclick = () => {
        messagesRenderer()
        topNav.classList.add('active')
        rooms.forEach((room) => {
            room.classList.remove('active')
        })
        chatTitle.textContent = `Web-Standart Group-2 Najot Ta'lim`
        chatFooter.classList.remove('hide')
        chatFooterRoom.classList.add('hide')
    }
}

chatFooterRoom.onsubmit = (e) => {
    e.preventDefault()
    let div = document.createElement('div')
    div.classList.add('msg-wrapper')
    div.classList.add('msg-from')
    div.innerHTML = `
        <img src=${profileAvatar.src} alt="profile-picture" />
        <div class="msg-text">
            <p class="msg-author">${profileName.textContent}</p>
            <p class="msg">${textInputRoom.value}</p>
            <p class="time">${getDate()}</p>
        </div>
    `
    chatMain.appendChild(div)
    socket.emit('sendMessage', ({senderId: profileName.dataset.id, receiverId: selectedUser.dataset.id, message: textInputRoom.value}))
}
socket.on('getMessage', ({ senderUser, receiverUser, message }) => {
    let rooms = document.querySelectorAll('.chats-item')
    rooms.forEach(room => {
        if (room.dataset.id == senderUser.id) {    
            if (!room.classList.contains('active')) {
                room.classList.add('active')
                topNav.classList.remove('active')
                selectedUser = room
                chatMain.innerHTML = null
            }
        }
    })
    let div = document.createElement('div')
    div.classList.add('msg-wrapper')
    div.innerHTML = `
        <img src=${'images/' + senderUser.avatar_link} alt="profile-picture" />
        <div class="msg-text">
            <p class="msg-author">${senderUser.username}</p>
            <p class="msg">${message}</p>
            <p class="time">${getDate()}</p>
        </div>
    `
    chatMain.appendChild(div)
    chatTitle.textContent = senderUser.username
    chatFooter.classList.add('hide')
    chatFooterRoom.classList.remove('hide')
    const typingStatus = document.querySelector('.online')
    socket.on('typing', () => {
        typingStatus.classList.remove('hide')
    })
    socket.on('stopping', () => {
        typingStatus.classList.add('hide')
	})
})

socket.on("getUsers", (users, id) => {
    users = users.filter(user => user.id != id)
    groupMembersRender()
    usersRenderer(users)
})

let timeOutId
function stopTyping () {
    socket.emit('stop typing')
}
textInputRoom.onkeyup = () => {
    socket.emit('start typing')
    if (timeOutId) clearTimeout(timeOutId)

    timeOutId = setTimeout(() => {
        stopTyping()
    }, 1000)
}

const getDate = () => {
    date = new Date()
    hour = date.getHours() > 10 ? date.getHours() : '0' + date.getHours() 
    minute = date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes() 
    return hour + ":" + minute
}
getDate()