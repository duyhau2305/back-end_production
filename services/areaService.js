// services/areaService.js
const Area = require('../models/areaModel');

async function createArea(data) {
    const area = new Area(data);
    return await area.save();
}

async function updateArea(id, data) {
    return await Area.findByIdAndUpdate(id, data, { new: true });
}

async function deleteArea(id) {
    return await Area.findByIdAndDelete(id);
}

async function getAreaById(id) {
    return await Area.findById(id);
}

async function getAllAreas() {
    return await Area.find();
}

module.exports = {
    createArea,
    updateArea,
    deleteArea,
    getAreaById,
    getAllAreas
};
