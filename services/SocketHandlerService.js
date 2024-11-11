const { Server } = require('socket.io');
const constants = require('../constants/constants');

let io;
const logQueue = []; 
let isProcessingLog = false;
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    const connectionInfo = createLog(constants.CONNECTION_ESTABLISHED, { 
      socketId: socket.id, 
      timestamp: new Date().toISOString() 
    });
    enqueueLog(connectionInfo);

    socket.on('call_help', (data) => {
      const helpEventInfo = createLog(constants.CALL_HELP_TRIGGERED, { 
        socketId: socket.id, 
        data, 
        timestamp: new Date().toISOString() 
      });
      enqueueLog(helpEventInfo);
      io.emit('update_call_status', data);
    });

    socket.on('cancel_call', (data) => {
      const cancelEventInfo = createLog(constants.CANCEL_CALL_TRIGGERED, { 
        socketId: socket.id, 
        data, 
        timestamp: new Date().toISOString() 
      });
      enqueueLog(cancelEventInfo);
      io.emit('cancel_call_status', data);
    });

    socket.on('disconnect', () => {
      const disconnectInfo = createLog(constants.CONNECTION_CLOSED, { 
        socketId: socket.id, 
        timestamp: new Date().toISOString() 
      });
      enqueueLog(disconnectInfo);
    });
  });
}


function createLog(status, data) {
  return { status, data };
}
function enqueueLog(log) {
  logQueue.push(log);
  processLogQueue();
}


async function processLogQueue() {
  if (isProcessingLog) return; 
  
  while (logQueue.length > 0) {
    const log = logQueue.shift();
    await handleLog(log); 
  }

  isProcessingLog = false;
}

async function handleLog(log) {
  console.log(log); 
}

function getIO() {
  if (!io) {
    return {
      status: constants.INTERNAL_ERROR,
      error: "Socket.io not initialized"
    };
  }
  return io;
}

module.exports = { initSocket, getIO };
