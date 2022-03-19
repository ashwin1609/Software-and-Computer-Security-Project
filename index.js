const registerService = require('./system_service/register');
const loginService = require('./system_service/login');
const authenticationService = require('./system_service/authentication');
const util = require('./utils/util');

const health = '/health';
const registerPage = '/register';
const loginPage = '/login';
const authPage = '/authentication';

exports.handler = async (event) => {
    console.log('Request Event: ', event);
    let response;
    switch (true) {
        case event.httpMethod === 'GET' && event.path === health:
            response = util.buildResponse(200);
            break;

        case event.httpMethod === 'POST' && event.path === registerPage:
            const registerBody =JSON.parse(event.body);
            response = await registerService.register(registerBody);
            break;

        case event.httpMethod === 'POST' && event.path === loginPage:
            response = util.buildResponse(200);
            break;

        case event.httpMethod === 'POST' && event.path === authPage:
            response = util.buildResponse(200);
            break;
        default:
        response = util.buildResponse(404, 'Page not Found!!!');
            
    }
    return response;
};
