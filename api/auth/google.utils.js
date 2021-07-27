const googleapis = require('googleapis')
const google = googleapis.google

/*******************/
/** CONFIGURATION **/
/*******************/

const googleConfig = {
  clientId: "77664739327-oa9va2n4jgbeho5h4gvl2i0pp45hqhnu.apps.googleusercontent.com",
  clientSecret: "cLAgDyvDabfvSb6r2wr7_fGl",   
  redirect: "http://localhost:3030/api/auth/google/login/auth", // this must match your google api settings
};

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

function  createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function  getConnectionUrl(auth) {
  console.log("auth is: " +  auth.generateAuthUrl)
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

function  getGooglePlusApi(auth) {
  return google.plus({ version: 'v2', auth });
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
function urlGoogle() {
  const auth = createConnection();
  console.log("auth is: "+ auth)
  const url = getConnectionUrl(auth);
  return url;
}

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
async function getGoogleAccountFromCode(code) {
  const oauth2Client = createConnection();
  const data = await oauth2Client.getToken(code);
  const tokens = data.tokens;
  
  oauth2Client.setCredentials(tokens)
  var oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  const userInfo = await oauth2.userinfo.get()
  console.log("this is the info " + JSON.stringify(userInfo))
  return userInfo;

  
//   const plus = getGooglePlusApi(auth);
//   const me = await plus.people.get({ userId: 'me' });
//   const userGoogleId = me.data.id;
//   const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
//   return {
//     id: userGoogleId,
//     email: userGoogleEmail,
//     tokens: tokens,
//   };
}

module.exports = {
  getGoogleAccountFromCode,
  urlGoogle
}