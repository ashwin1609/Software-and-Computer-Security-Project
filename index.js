const registerService = require('./system_services/register');
const loginService = require('./system_services/login');
const health = '/check';
const registerPage = '/register';
const loginPage = '/login';

exports.handler = async (event) => {
    console.log('Request Event: ', event);
    let response;

    if(event.httpMethod === 'GET' && event.path === health){
        response = buildResponse(200);
    }
    else if (event.httpMethod === 'POST' && event.path === registerPage){
        const registerBody = JSON.parse(event.body);
        response = await registerService.register(registerBody);
    }
    else if (event.httpMethod === 'POST' && event.path === loginPage){
        const loginBody = JSON.parse(event.body);
        response = await loginService.login(loginBody);
    }
    else{
        response = buildResponse(404, 'Page not Found!!!');
    }
    return response;
};

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