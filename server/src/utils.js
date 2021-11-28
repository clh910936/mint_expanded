// takes in a string (no extension) as the name of the file
// takes in a piece of data to write to a json file
const fs = require('fs');

module.exports = {
    writeToFile: function (name, jsonData) {
        let data = JSON.stringify(jsonData);
        const path = `./output/${name}.json`
        fs.writeFileSync(path, data);
    },

    copyObject: function (initialObj) {
        return JSON.parse(JSON.stringify(initialObj));
    },

    writeError: function (title, description, functionName) {
        console.error(title, description, `Happened at '${functionName}'`);
    }
};