const serviceStatus = '/check';
const registerPage = '/register';
const loginPage = '/login';

const registerService = require('./Services/register');
const loginService = require('./Services/login');

// Asynchronous function to guide the Lambda function to its appropriate service
exports.handler = async (event) => {
    console.log('Request Event: ', event);
    let response;
    // To Check if the web service is active and return a 200 status code if it is
    if(event.httpMethod === 'GET' && event.path === serviceStatus){
        response = buildResponse(200);
    }
    // To direct the user to register page securely using POST method
    else if (event.httpMethod === 'POST' && event.path === registerPage){
        const registerValues = JSON.parse(event.body);
        response = await registerService.register(registerValues);
    }
    // To direct the user to login page securely using POST method
    else if (event.httpMethod === 'POST' && event.path === loginPage){
        const loginBody = JSON.parse(event.body);
        response = await loginService.login(loginBody);
    }
    // Returns a 404 error if the web service is not active
    else{
        response = buildResponse(404, 'Page not Found!!!');
    }
    return response;
};

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