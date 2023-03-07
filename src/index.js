const http = require('node:http');
const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser')

const { URL } = require('node:url');

const server = http.createServer((request, response) => {
  console.log(`Endpoint: ${request.url} | Method: ${request.method}`);

  const parsedUrl = new URL(`http://localhost:3000${request.url}`);

  let { pathname } = parsedUrl;

  let splitEndpoint = pathname.split('/').filter(Boolean);
  let id = null;

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  const route = routes.find((routeObj) => {
    return routeObj.endpoint === pathname && routeObj.method === request.method;
  });

  if (route) {
    request.params = { id };
    request.query = Object.fromEntries(parsedUrl.searchParams);

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(body));
    }

		if (['POST', 'PUT'].includes(request.method)) {
			bodyParser(request, () => route.handler(request, response))
		} else {
			route.handler(request, response);
		}
  } else {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`);
  }
});

server.listen(3000, () => console.log('server listening on port 3000'));