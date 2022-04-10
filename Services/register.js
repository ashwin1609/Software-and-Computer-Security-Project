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
    if(registeredUserName){
        if(registeredUserName.username){
            return buildResponse(401, {
                message: 'The username you have entered exists in our database. Please select a new username!!!! '
            })
        }
    }
    
    // Stores the password in an encrypted manner in the database
    const passwordEncryption = bcrypt.hashSync(password.trim(), 15);
    const RegisteringUser = {
        name: name,
        email: email,
        username: username,
        password: passwordEncryption
    }

    // Function call to save user information
    const storeUserInformation = await saveUser(RegisteringUser);
    // Returns a 503 response code if the system is not able to add information to the dynamoDB
    if(!storeUserInformation){
        return buildResponse(503, {
            message: 'Server Error. User information was not added to the Database.'
        })
    }
    // returns a 200 response code if user was successfully registered
    return buildResponse(200, { message: 'User information was added to the Database'});
}

// Asynchronous function that stores user information to the DynamoDB database.
// Takes the table name and the body elements as its parameter.
async function saveUser(user){
    const params = {
        TableName: Table,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error("The user information was not saved!!!", error)
    });
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