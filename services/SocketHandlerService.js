const WebSocket = require('ws');
const constants = require('../constants/constants');
const MachineOperationStatusService = require('./MachineOperationStatusService');

let wss;
const logQueue = [];
let isProcessingLog = false;
function initSocket(server) {
  wss = new WebSocket.Server({ server});

  wss.on('connection', (ws) => {
    const connectionInfo = createLog(constants.CONNECTION_ESTABLISHED, {
      timestamp: new Date().toISOString()
    });
    enqueueLog(connectionInfo);

    ws.on('message', (message) => {
      try {
        const msg = JSON.parse(message);
        if (msg.event === 'call_help' || msg.event === 'cancel_help') {
          // Broadcast lại cho tất cả client (trừ client gửi)
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          });
        }
      } catch (err) {
        console.error('Error handling ws message:', err);
      }
    });

    ws.on('close', () => {
      const disconnectInfo = createLog(constants.CONNECTION_CLOSED, {
        timestamp: new Date().toISOString()
      });
      enqueueLog(disconnectInfo);
    });
  });

  // Gửi current status của tất cả máy mỗi 5 giây
  setInterval(async () => {
    try {
      const allMachines = await MachineOperationStatusService.getAllMachine();
      if (allMachines.status === constants.RESOURCE_SUCCESSFULLY_FETCHED) {
        const statusPromises = allMachines.data.map(async (machine) => {
          const statusRes = await MachineOperationStatusService.getCurrentStatus(machine._id);
          return {
            machineId: machine._id,
            status: statusRes.data || 'Offline',
          };
        });
        const statuses = await Promise.all(statusPromises);
        const payload = JSON.stringify({ event: 'current_status_update', data: statuses });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    } catch (err) {
      console.error('Error sending current status via websocket:', err);
    }
  }, 1000);
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
  if (!wss) {
    return {
      status: constants.INTERNAL_ERROR,
      error: "WebSocket not initialized"
    };
  }
  return wss;
}

module.exports = { initSocket, getIO };
