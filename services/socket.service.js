

const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('New socket - socket.handshake.sessionID', socket.handshake.sessionID)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        // TODO: emitToUser feature - need to tested for CaJan21
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('card topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            console.log('joined card', topic);
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
        })
        socket.on('board topic', topic => {
            if (socket.boardTopic === topic) return;
            if (socket.boardTopic) {
                socket.leave(socket.boardTopic)
            }
            socket.join(topic)
            console.log('joined board', topic);
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.boardTopic = topic
        })
        // socket.on('chat newMsg', msg => {
        //     console.log('socket-service newMsg called');
        //     // emits to all sockets:
        //     // gIo.emit('chat addMsg', msg)
        //     // emits only to sockets in the same room
        //     gIo.to(socket.myTopic).emit('chat addMsg', msg)
        // })
        socket.on('user-watch', userId => {
            socket.join(userId)
            console.log(`user ${userId} watching his cards`);
        })
        socket.on('cardUpdated', data => {
            socket.to(socket.myTopic).emit('updateCard', data)
        })
        socket.on('groupAdded', data => {
            socket.to(socket.boardTopic).emit('addGroup', data)
        })
        socket.on('boardUpdated', data => {
            socket.to(socket.boardTopic).emit('updateBoard', data)
        })
        socket.on('groupRemoved', data => {
            socket.to(socket.boardTopic).emit('removeGroup', data)
        })
        socket.on('cardRemoved', data => {
            socket.to(socket.boardTopic).emit('removeCard', data)
        })
        socket.on('cardAdded', data => {
            socket.to(socket.boardTopic).emit('addCard', data)
        })
        socket.on('notifyMember', ({fullActivity, userId}) => {
            // console.log('data', fullActivity, userId);
            socket.to(userId).emit('notifyMemberActivity', fullActivity)
            // emitToUser('notifyMemberActivity', fullActivity, userId)
            console.log('watched user notified');
        })
    })
}


function emitToAll({ type, data, room = null }) {
    if (room) socket.to(room).emit(type, data)
    else gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null }) {
    const store = asyncLocalStorage.getStore()
    // console.log(store);
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emitToAll,
    emitToUser,
    broadcast,
}



