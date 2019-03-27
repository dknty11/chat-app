const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#message')
const $messageFormButton = $messageForm.querySelector('button')
const $sharedLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
// const $locationMessage = document.querySelector('#location-message')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// OPtions
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        url: message.text,
        createdAt: moment(message.createdAt).format('H:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    // disable form
    $messageFormButton.setAttribute('disabled', 'disabled')

    // target we're listening for the eventfffff
    const message  = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sharedLocationButton.addEventListener('click', () => {
    // Disable button
    $sharedLocationButton.setAttribute('disabled', 'disabled')

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    
    navigator.geolocation.getCurrentPosition((position) => {
        // const lat = position.coords.latitude
        // const long = position.coords.longitude
        // enable button
        
        socket.emit('sendLocation', `https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`, (message) => {
            $sharedLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', { username, room })