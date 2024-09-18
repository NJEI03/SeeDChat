// db.js - JSON file to store and retrieve user data
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbFilePath = 'db.json';

let users = [];

// Load user data from JSON file
const loadData = () => {
    try {
        const data = fs.readFileSync(dbFilePath);
        users = JSON.parse(data);
    } catch (error) {
        // File doesn't exist or is empty
        console.log('No existing user data found.');
    }
};

// Save user data to JSON file
const saveData = () => {
    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2));
};

// Function to add a new user to the JSON file
const addUser = (username, password) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    saveData();
};

// Initialize by loading existing data
loadData();

module.exports = {
    getUsers: () => users,
    addUser,
};