const Area = require('../models/Area');
const Device = require('../models/Device');
const Employee = require('../models/Employee');

// Create a new area
async function createArea(areaData) {
    const area = new Area(areaData);
    return await area.save();
}

// Update the area and synchronize with Device and Employee collections
async function updateArea(areaId, updateData) {
    const existingArea = await Area.findById(areaId);

    if (!existingArea) {
        throw new Error('Area not found');
    }

    const { areaName } = updateData;

    // If areaName has changed, update related Devices and Employees
    if (areaName && areaName !== existingArea.areaName) {
        const updatedArea = await Area.findByIdAndUpdate(areaId, updateData, { new: true });

        // Update areaName in Device and Employee collections
        await Device.updateMany(
            { areaName: existingArea.areaName }, // Find devices with the old areaName
            { areaName: areaName } // Set the new areaName
        );

        await Employee.updateMany(
            { areaName: existingArea.areaName }, // Find employees with the old areaName
            { areaName: areaName } // Set the new areaName
        );

        return updatedArea;
    } else {
        // If areaName has not changed, just update the area document
        return await Area.findByIdAndUpdate(areaId, updateData, { new: true });
    }
}

// Delete an area and set areaName to null in related devices and employees
async function deleteArea(areaId) {
    const area = await Area.findById(areaId);

    if (!area) {
        throw new Error('Area not found');
    }

    // Set areaName to null for all related devices and employees
    await Device.updateMany(
        { areaName: area.areaName }, // Find devices with the old areaName
        { $set: { areaName: null } } // Set areaName to null
    );

    await Employee.updateMany(
        { areaName: area.areaName }, // Find employees with the old areaName
        { $set: { areaName: null } } // Set areaName to null
    );

    // Delete the area
    return await Area.findByIdAndDelete(areaId);
}

// Get an area by ID
async function getAreaById(areaId) {
    return await Area.findById(areaId);
}

// Get all areas
async function getAllAreas() {
    return await Area.find();
}

module.exports = {
    createArea,
    updateArea,
    deleteArea,
    getAreaById,
    getAllAreas,
};
