const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')


async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    // console.log('file: auth.service.js ~ line 10 ~ login ~ user', user);
    
    if (!user) return Promise.reject('Invalid username or password')
    // TODO: un-comment for real login
    // console.log( 'line 14','password',password, 'user.password', user.password);

    const match = await bcrypt.compare(password, user.password)
    // console.log('file: auth.service.js ~ line 15 ~ login ~ match', match);
    
    if (!match) return Promise.reject('Invalid username or password')

    delete user.password
    return user
}

async function signup(username, password, fullname, email) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname, !email) return Promise.reject('fullname, username and password are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname, email })
}

module.exports = {
    signup,
    login,
}