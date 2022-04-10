// Configuration required to use AWS
const AWS = require('aws-sdk')
AWS.config.update({
    region: 'us-east-1'
})

const dynamodb = new AWS.DynamoDB.DocumentClient();
// Node js module that was used to store the password in an encrypted manner
const bcrypt = require('bcryptjs');
// Table name that was created using the AWS Console
const Table = 'UserInfo';

// Asynchronous function that takes the registration values from index.js
async function register(values){
    const name = values.name;
    const email = values.email;
    const username = values.username;
    const password = values.password;

    // Checks if all the fields were provided by the user 
    if(!username || !name || !email || !password){
        return buildResponse(401, {
            message: 'All input fields are required to register!!!'
        })
    }

    // Gets the user information from the database if it exists 
    const registeredUserName = await getUser(username);
    
    // Condition to check if the username entered already exists in our database.
    // If the username exists, then the following message is printed 
    if(registeredUserName && registeredUserName.username){
        return buildResponse(401, {
            message: 'The username you have entered exists in our database. Please select a new username!!!! '
        })
    }
    
    // Stores the password in an encrypted manner in the database
    const passwordEncryption = bcrypt.hashSync(password.trim(), 10);
    const Registeringuser = {
        name: name,
        email: email,
        username: username,
        password: passwordEncryption
    }

    const storeUserResponse = await saveUser(Registeringuser);
    if(!storeUserResponse){
        return buildResponse(503, {
            message: 'Server Error. Please try again later'
        })
    }
    return buildResponse(200, { message: 'User was added Successfully'});
}

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
        console.error("There is an error getting user:", error);
    })
}

async function saveUser(user){
    const params = {
        TableName: Table,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error("There is an error saving user:", error)
    });
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


module.exports.buildResponse = buildResponse;
module.exports.register = register;