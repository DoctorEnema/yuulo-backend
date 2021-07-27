const authService = require('./auth.service')
const googleUtils = require('./google.utils')
const logger = require('../../services/logger.service')


async function login(req, res) {
    const { username, password } = req.body
    // console.log('file: auth.controller.js ~ line 6 ~ login ~ username, password', username, password);


    try {
        const user = await authService.login(username, password)
        req.session.user = user
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function getGoogleUrl(req, res) {
    const googleLogingUrl = googleUtils.urlGoogle()
    console.log('login url is', googleLogingUrl)
    res.json(googleLogingUrl)
}

async function googleAuth(req, res) {
    try {
        const code = req.query.code
        const userInfo = await googleUtils.getGoogleAccountFromCode(code)
        const email = userInfo.data.email
        console.log('Try to login, this is user info', userInfo.data.email)
        console.log('userInfo.data', userInfo.data);
        var user = await authService.loginByEmail(userInfo.data.email)
        if (!user) var user = await authService.signupGoogleUser(userInfo.data)
        console.log('user', user)
        req.session.user = user
        console.log(process.env.NODE_ENV,'process.env.NODE_ENV');
        if (process.env.NODE_ENV === 'production') {
            res.status(301).redirect('https://yuulo.herokuapp.com')
        } else {
            res.status(301).redirect('http://localhost:8080/board/60fa7a223d6d273440477d69')
        }

        // res.status(301).redirect('http://localhost:8080')
    } catch (err) {
        if (process.env.NODE_ENV === 'production') {
            res.status(301).redirect('https://yuulo.herokuapp.com/')
        } else {
            res.status(301).redirect('http://localhost:8080')
        }
        console.log('cannot authenticate user', err);
    }
}

async function signup(req, res) {
    try {
        const { username, password, fullname, email } = req.body
        // Never log passwords
        // logger.debug(fullname + ', ' + username + ', ' + password)
        const account = await authService.signup(username, password, fullname, email)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        const user = await authService.login(username, password)
        req.session.user = user
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res) {
    try {
        req.session.destroy()
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

async function checkIfUserExists(req, res) {
    try {
        const user = req.session.user
        console.log('userSession', user);
        if (user) res.send(user)
        else res.send(null)
    } catch (err) {
        res.status(500).send({ err: 'Failed to get user session' })
    }
}
module.exports = {
    login,
    signup,
    logout,
    getGoogleUrl,
    googleAuth,
    checkIfUserExists
}