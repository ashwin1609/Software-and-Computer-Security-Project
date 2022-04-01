const AWS = require('aws-sdk')
AWS.config.update({
    region: 'us-east-1'
})
const dynamodb = new AWS.DynamoDB.DocumentClient();
const UserTable = 'UserTable';
const util = require('../utils/util')
const bcrypt = require('bcryptjs');

async function register(UserInfo){
    const name = UserInfo.name;
    const email = UserInfo.email;
    const username = UserInfo.username;
    const password = UserInfo.password;

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

    const encryptedPassword = bcrypt.hashSync(password.trim(), 10);
    const user = {
        name: name,
        email: email,
        username: username.toLowerCase().trim(),
        password: encryptedPassword
    }

    const storeUserData = await saveUser(user);
    if(!storeUserData){
        return util.buildResponse(503, {
            message: 'Server Error. Please try again later'
        })
    }
    return util.buildResponse(200, { username: username});
}

async function getUser(username) {
    const params = {
        TableName: UserTable,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return response.Item;
    }, error => {
        console.error("There is an error:", error);
    })
}

async function saveUser(user){
    const params = {
        TableName: serTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then(() => {
        return true;
    }, error => {
        console.error("There is an error:", error);
    })
}

module.exports.register = register;