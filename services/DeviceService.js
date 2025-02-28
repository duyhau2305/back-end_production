const Device = require('../models/Device'); 
const Issue = require('../models/Issue'); 

// Create a device
async function createDevice(deviceData) {
  try {
    const device = new Device(deviceData);
    return await device.save();
  } catch (error) {
    console.error('Error creating device:', error);
    throw new Error('Failed to create device');
  }
}

// Get a device by deviceId
async function getDeviceById(deviceId) {
  try {
    console.log("Fetching device with deviceId:", deviceId);

    if (!deviceId) {
      throw new Error("Invalid deviceId: deviceId is null or undefined");
    }

    const device = await Device.findOne({ deviceId });

    if (!device) {
      console.log(`Device with ID ${deviceId} not found.`); 
      return null; 
    }

    return device;
  } catch (error) {
    console.error('Error fetching device by ID:', error.message);
    throw new Error(`Failed to get device by ID: ${error.message}`);
  }
}


// Update a device by ID
async function updateDevice(id, deviceData) {
  try {
    // Lấy thiết bị hiện tại
    const existingDevice = await Device.findById(id);
    if (!existingDevice) {
      throw new Error('Device not found for update');
    }

    const oldDeviceName = existingDevice.deviceName;
    const newDeviceName = deviceData.deviceName;

   
    const updatedDevice = await Device.findByIdAndUpdate(id, deviceData, { new: true });

   
    if (newDeviceName && newDeviceName !== oldDeviceName) {
      await Issue.updateMany(
        { deviceNames: oldDeviceName }, 
        { $set: { "deviceNames.$": newDeviceName } } 
      );
    }

    return updatedDevice;
  } catch (error) {
    console.error('Error updating device:', error);
    throw new Error('Failed to update device');
  }
}

async function deleteDevice(id) {
  try {
    const existingDevice = await Device.findById(id);
    if (!existingDevice) {
      throw new Error('Device not found for deletion');
    }

    const oldDeviceName = existingDevice.deviceName;

    await Issue.updateMany(
      { deviceNames: oldDeviceName }, 
      { $pull: { deviceNames: oldDeviceName } } 
    );

    const deletedDevice = await Device.findByIdAndDelete(id);
    return deletedDevice;
  } catch (error) {
    console.error('Error deleting device:', error);
    throw new Error('Failed to delete device');
  }
}

// Get all devices
async function getAllDevices() {
  try {
    const devices = await Device.find();
    return devices;
  } catch (error) {
    console.error('Error fetching all devices:', error);
    throw new Error('Failed to fetch devices');
  }
}

// Export the service functions
module.exports = {
  createDevice,
  getDeviceById,
  updateDevice,
  deleteDevice,
  getAllDevices,
};
