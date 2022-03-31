const AWS = require('aws-sdk')
AWS.config.update({
    region: 'us-east-1'
})
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'UserInfo';
const util = require('../utils/util')
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth')


async function login(user) {
    const username = user.username;
    const password = user.password;
    if(!user || !username || !password){
        return util.buildResponse(401,{
            message: 'Username and Password are required'
        }); // He forget in the video 30:58
   }

   const dynamoUser = await getUser(username.toLowercase().trim())
    if(!dynamoUser ||! dynamoUser.username) {
        return util.buildResponse(403 ,
            {message: 'user does not exist'});
    }

    if(!bcrypt.compareSync(password, dynamoUser.password)){
        return util.buildResponse( 403, { message: 'password  is incorrect '});
    }

    const UserInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(UserInfo)
    const response = {
        user:UserInfo,
        token: token
    }

    return util.buildResponse(200, response);
}

async function getUser(username) {
    const param = {
        TableName: userTable,
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

module.exports.login = login;