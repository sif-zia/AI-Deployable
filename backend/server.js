const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors module

const app = express();
const port = 4000; // Or any other port you prefer

// Allow CORS for all origins
app.use(cors());

// Serve the model.json file
app.get('/model.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'ModelInJSON', 'model.json'));
});

// Serve the group1-shard files
app.get('/group1-shard*', (req, res) => {
  const shardNumber = req.params[0];
  res.sendFile(path.join(__dirname, 'ModelInJSON', `group1-shard${shardNumber}`));
});

// Say hello to the user
app.get('/', (req, res) => {
  res.send('Hello, user!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
