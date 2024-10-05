// controllers/areaController.js
const areaService = require('../services/areaService');

async function createArea(req, res) {
    try {
        const area = await areaService.createArea(req.body);
        res.status(201).json(area);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function updateArea(req, res) {
    try {
        const area = await areaService.updateArea(req.params.id, req.body);
        if (!area) {
            return res.status(404).json({ message: 'Area not found' });
        }
        res.status(200).json(area);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteArea(req, res) {
    try {
        const area = await areaService.deleteArea(req.params.id);
        if (!area) {
            return res.status(404).json({ message: 'Area not found' });
        }
        res.status(200).json({ message: 'Area deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAreaById(req, res) {
    try {
        const area = await areaService.getAreaById(req.params.id);
        if (!area) {
            return res.status(404).json({ message: 'Area not found' });
        }
        res.status(200).json(area);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAllAreas(req, res) {
    try {
        const areas = await areaService.getAllAreas();
        res.status(200).json(areas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createArea,
    updateArea,
    deleteArea,
    getAreaById,
    getAllAreas
};
