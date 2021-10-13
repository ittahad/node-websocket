
const app = require('./app');

// module.exports.socketIOFunc = (next) => {
//     app.socketIo.on('connection', (socket) => {
//         socket.setMaxListeners(0);
//         securityContext.verifySocketToken(socket, socketUtility, next);
//     });
// };

module.exports.socketNotify = (filter, event) => {
  app.socketIo
    .to(filter)
    .emit("response", event);
}

module.exports.socketBroadcast = (event) => {
  app.socketIo
  .emit('response', event);
}

module.exports.socketUtility = (socket) => {
    socket.on('subscribe', (filter) => {
      let filterSerialized = JSON.stringify(filter);
      socket.join(filterSerialized);
      socket
        .to(filterSerialized)
        .emit(
          "response",
          JSON.stringify({status: 'Subscribed', id: socket.id})
        );
    });
  
    // Runs when client disconnects
    socket.on('disconnect', () => {
      socket.removeAllListeners('connection');
      console.log("Disconnected!!");
    });
  };