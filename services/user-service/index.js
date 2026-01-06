const express = require('express');
const cors = require('cors'); // <-- add this
const { init, getUsers, addUser } = require('./db');

const app = express();
app.use(express.json());
app.use(cors()); // <-- enable CORS for all origins

init();

app.get('/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching users');
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = await addUser(req.body);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding user');
  }
});

app.listen(3003, () => console.log('User Service running on port 3003'));

