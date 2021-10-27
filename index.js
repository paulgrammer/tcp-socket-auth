const net = require("net");
const chalk = require('chalk');

class Server extends net.Server {
  constructor(users) {
    super()
    this.users = users;
    this.on('connection', this.onConnect.bind(this));
  }

  middleware(client, callback) {
    let promptName = () => {
      client.write(`${chalk.blue('username')}> `);
      client.username = true;
      client.password = false;
    };

    let promptPass = () => {
      client.write(`${chalk.blue('password')}> `);
      client.username = false;
      client.password = true;
    };

    promptName();

    client.on("data", (data) => {
      data = data.toString('utf8').replace(/[\r\n]+/g, "")

      if(client.username) {
        let user = this.users.find((i) => i.username === data);
        if(user) {
          client.user = user;
          return promptPass();
        } 
        
        client.write("User doesn't exist.\n")
        return promptName();
      } 
      
      if(client.password) {
        if(client.user.password === data) {
          client.password = false;
         return callback(client)
        }

        client.write("Incorrect password.\n")
        return promptPass();
      }
    });
  }

  response(client, message) {
    client.write(`${message}\n${chalk.yellowBright(client.user.username)}@${
      chalk.blue(this.address().address)}> `);
  }

  onConnect(client) {
    this.middleware(client, (client) => {
      this.response(client, "Successfully logged in! \n");
      client.on("data", (data) => {
        data = data.toString().replace(/[\r\n]+/g, "");
        this.emit('request', data, this.response.bind(this, client), client);
      });
    });
  }
}

module.exports = Server;

