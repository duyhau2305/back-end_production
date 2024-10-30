module.exports = {
    getMachineStatus(value) {
        switch (value) {
            case 1: return "Run";
            case 2: return "Idle";
            case 0: return "Stop";
            default: return "None";
        }
    }
}