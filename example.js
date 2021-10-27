const Server = require('./index');
const execute = require('./execute');

let server = new Server([
  { username: 'admin', password: 'admin'}
]);

server.on('request', async function (request, response, client) {
  let cmd = request.trim();
  
  switch (cmd) {
    case 'exit': 
    case 'logout': 
      client.end();
    break;

    case '': 
      response('');
    break;

    default: {
      let args = cmd.split(' ');
      /**
       * To run system commands append 'sys' to your command.
       */
      if(args.length > 1 && ['sys'].includes(args.shift())) {
        execute(args.join(' ')).then((content) => response(content))
        .catch((error) => response(error.message));
      } else {
        response(`Command '${request}' not found`);
      }
    }
  }
})

server.listen(8080, "127.0.0.1", function () {
  console.log(`Listing ${this.address().address} ${this.address().port}`)
});