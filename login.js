import bodyParser from "body-parser";
import express from "express";
import fs from 'fs';
import bcrypt from 'bcrypt'
import { fileURLToPath } from "node:url";
import path, { dirname, join } from 'node:path';



const app = express();
const PORT = 8000;
const __dirname = dirname(fileURLToPath(import.meta.url))


// app.use(express.static("Public"));
app.use(express.static('public'
))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// read existing users from the db.js file
let users = [];
try {
    const data = fs.readFileSync('db.js', 'utf8');
    users = JSON.parse(data.replace('export const database =', ''));
    console.log(data);
} catch (error) {
    console.error('Error reading db.js file: ', error);
}
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html')
});



// Register Route 
app.post('/chat', async (req, res) => {

    res.sendFile(__dirname + '/public/login.html')

    const { username, email, password } = req.body;

    // check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user to the array 
    users.push({ username, email, password: hashedPassword });

    // store updated user to the array
    fs.writeFileSync('db.js', `export const database = ${JSON.stringify(users)}
    `);

    // res.render('login.ejs)
    res.status(201).json({ message: 'User registered succesfully' });

})

// login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user by email from the stored users
    const user = users.find(user => username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found " });
    }

    // check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(404).json({ message: 'Invalid password' });
    }

    res.render('<h1>welcome</h2>')
})

// app.get("/posting", (req, res) => {
//     res.render("post.ejs")
// })

// app.post("/post", (req, res) => {
//     const { title, Subtitle, post } = req.body;
//     // console.log(req.body);
//     res.render('show.ejs', { title, Subtitle, post })


// })



app.listen(PORT, () => {
    console.log(`The server is running on Port ${PORT}`);
})

