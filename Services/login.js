// Configuration required to use AWS
const AWS = require('aws-sdk')
AWS.config.update({
    region: 'us-east-1'
})
// Json Web Tokens was used to generate session ID
const JWT = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
// Table name that was created using the AWS Console
const Table = 'UserInfo';
// Node js module that was used to store the password in an encrypted manner
const bcrypt = require('bcryptjs');
const auth = require('./auth')

// Asynchronous function that takes the login values from index.js
async function login(values) {
    const username = values.username;
    const password = values.password;

    // Checks if all the fields were provided by the user to log into the system. 
    if(!values || !username || !password){
        return util.buildResponse(401,{
            message: 'All input fields are required to login!!!'
        })
   }
    // Gets the user information from the database if it exists 
   const loginUser = await getUser(username)
   // Checks if the database contains the entered user's information
    if(!loginUser ||! loginUser.username) {
        return util.buildResponse(403 , { message: 'You have entered an username that does not exist in our database.'});
    }

    // Compares the password that was entered with the stored hash password in the database.
    // The entered password is hashed the same way it was done while registering so that they can be compared.
    if(!bcrypt.compareSync(password, loginUser.password)){
    return util.buildResponse( 403, { message: 'The entered password is incorrect. Please enter the correct password!!!'});
    }

    // Creating a user session ID
    const userSession = {
        username: loginUser.username,
        name: loginUser.name
    }

 // Function call to generate unique session ID for each user.
    const sessionID = generateSessionID(userSession)
    const response = {
        user:userSession,
        session: sessionID
    }

    return buildResponse(200, response);
}

// Asynchronous function that gets user information from DynamoDB.
// Takes the table name and username as the parameters. The username is considered as the key to query for information. 
async function getUser(username) {
    const params = {
        TableName: Table,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error("The system is not able to return user information. Please try again later.", error);
    })
}

// Function that generates unique session ID
// SECRET_TOKEN is the environment variable that was created in the AWS Console
// The value of SECRET_TOKEN was encrypted using the sha256 encryption algorithm.
function generateSessionID(userSessionInfo) {
    if(!userSessionInfo){
        return null;
    }

    return JWT.sign(userSessionInfo, process.env.SECRET_TOKEN, {
        // SECRET_TOKEN expires in 30 min or 1800 seconds
        expiresIN: '1800s'
    })
}

// To return the error message in a JSON format 
function buildResponse(statusCode, body){
    return{
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'applcation/json'
        },
        body: JSON.stringify(body)
    }
}

module.exports.generateSessionID = generateSessionID;
module.exports.buildResponse = buildResponse;
module.exports.login = login;