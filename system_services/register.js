const AWS = require('aws-sdk')
AWS.config.update({
    region: 'us-east-1'
})
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'UserTable';
const util = require('../utils/util')
const bcrypt = require('bcryptjs');

async function register(userInfo){
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    const password = userInfo.password;

    if(!username || !name || !email || !password){
        return util.buildResponse(401, {
            message: 'All inputs fields are required!!'
        })
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());
    if(dynamoUser && dynamoUser.username){
        return util.buildResponse(401, {
            message: 'The following username exists in our database '
        })
    }

    const encryptedPW = bcrypt.hashSync(password.trim(), 10);
    const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptedPW
    }

    const storeUserResponse = await saveUser(user);
    if(!storeUserResponse){
        return util.buildResponse(503, {
            message: 'Server Error. Please try again later'
        })
    }
    return util.buildResponse(200, { username: username});
}

async function getUser(username) {
    const params = {
        TableName: userTable,
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
        TableName: userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error("There is an error saving user:", error)
    });
}

module.exports.register = register;