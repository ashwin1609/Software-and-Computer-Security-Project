// using json webtoken
const jwt = require('jsonwebtoken');

function generateToken(UserInfo) {
    if(!UserInfo){
        return null;
    }

    // you can also hardcode the secret key if you want at 33.36
    return jwt.sign(UserInfo, process.env.JWT_SECRET, {
        expiresIN: '1h'
    })
}

    function verifyToken(username, token) {
        return jwt.verify(token, process.env.JWT_SECRET, (error, response) =>{
            if (error){
                return {
                    verified: false,
                    message: 'invalid token'
                }
            }

            if(response.username !== username){
                return {
                    verified: false,
                    message: 'invalid user'
                } 
            }

            return {
                verified: true,
                message: 'verified' 
            }
        } )
    }


module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
