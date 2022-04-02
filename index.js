const registerService = require('./system_services/register');
const loginService = require('./system_services/login');
const authenticationService = require('./system_services/authentication');
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
            const loginBody = JSON.parse(event.body);
            response = await loginService.login(loginBody);
            break;

        case event.httpMethod === 'POST' && event.path === authPage:
            const authBody = JSON.parse(event.body);
            response = authenticationService.authentication(authBody); 
            break;
        default:
        response = util.buildResponse(404, 'Page not Found!!!');
            
    }
    return response;
};
