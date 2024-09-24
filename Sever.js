import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path, { dirname } from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { fileURLToPath } from 'url';


// Set __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// User database 
let users = [];

// Load users from db.json function
const loadUsers = () => {
  const dbFilePath = path.join(__dirname, 'data', 'db.json');
  if (!fs.existsSync(dbFilePath)) {
    // Create an empty db.json if it doesn't exist
    fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2));
    console.log('Created empty db.json');
  }
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    users = JSON.parse(data);
    console.log('Loaded users from db.json');
  } catch (error) {
    console.error('Error reading db.json file: ', error);
  }
};

// Load users at startup
loadUsers();

const app = express();
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, { connectionStateRecovery: {} });

// Body parser middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: false }));

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Serve SeeDChat
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'SeeDChat.html'))
})
// Serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'signup.html'));
});

// Sign up route
app.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { username, email, password } = req.body;

  const imagePath = `/uploads/${req.file.filename}`;
  // Check if username already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send('Username already exists');
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to database
  const newUser = {
    username,
    email,
    password: hashedPassword,
    profileImage: req.file ? req.file.filename : null
  };
  users.push(newUser);

  // Save users to db.json
  try {
    const dbFilePath = path.join(__dirname, 'data', 'db.json');
    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2));
    console.log('User saved to db.json');
  } catch (error) {
    console.error('Error saving to db.json: ', error);
    return res.status(500).send('Error saving user data');
  }

  res.redirect('/login');
});

// Log in route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'login.html'));
});
app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;

  // Load users from db.json before login attempt
  loadUsers();

  // Find user in database
  const user = users.find(user => user.email === email);

  if (user) {
    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      // Redirect to chat app
      res.redirect('/chat');
    } else {
      res.status(404).send('Invalid password');
    }
  } else {
    res.status(401).send('User not found');
  }
});


// Chat app route
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'chat.html'));
});

// searching Route
app.get('/search', (req, res) => {
  const { username } = req.query;
  console.log('received search:', username);

  fs.readFile('./data/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erro readinf Db.json: ', err);
      res.status(500).json({ message: 'Erro searching for user' });
    } else {
      const UsersData = JSON.parse(data);
      const user = UsersData.find(user => user.username === username);
      if (user) {
        res.json({ username: user.username, profileImage: user.profileImage });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('new-user', (name) => {
    console.log('New user connected:', name);
    socket.broadcast.emit('user-connected', name);
    socket.username = name;
  });

  socket.on('chat message', (msg) => {
    console.log('chat message:', msg);
    const messageData = {
      name: socket.username,
      msg: msg
    };
    io.emit('chat message', messageData);
  });

  socket.on('typing', (isTyping) => {
    const typingData = {
      username: socket.username,
      isTyping: isTyping
    };
    socket.broadcast.emit('typing', typingData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.username);
    socket.broadcast.emit('userDisconnected', socket.username);
  });
});



server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});