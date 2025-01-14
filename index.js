require('dotenv').config();  // Add this line at the top
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

const {
  createUser,
  createItem,
  createMonster,
  createTransaction,
  createWeapon
} = require('./Functions/CreateFunction');

const {
  findUserByUsername,
  findUserById
} = require('./Functions/FindFunction');

const {
  existingUser,
  existingItem,
  existingMonster,
  existingWeapon
} = require('./Functions/ExistingFunction');

const {
  generateToken,
  ADMIN,
  USER
} = require('./Functions/TokenFunction');

const {
  monsterslain,
  deleteUser,
  reportUser
} = require('./Functions/OtherFunction');

const {
  viewLeaderboard,
  viewUserByAdmin
} = require('./Functions/ViewFunction');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Assignment');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors:true
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error in run function:", error);
  }
}

run().catch(console.dir);

// Routes for child functions
app.post('/createUser', async (req, res) => {
  try {
    const { user_id, username, password, email } = req.body;
    await createUser(client, user_id, username, password, email);
    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(500).send("Error creating user");
  }
});

app.post('/createItem', async (req, res) => {
  try {
    const { item_id, name, description, type, attributes, rarity } = req.body;
    await createItem(client, item_id, name, description, type, attributes, rarity);
    res.status(201).send("Item created successfully");
  } catch (error) {
    res.status(500).send("Error creating item");
  }
});

app.post('/createMonster', async (req, res) => {  
  try {
    const { monster_id, name, attributes, location } = req.body;
    await createMonster(client, monster_id, name, attributes, location);
    res.status(201).send("Monster created successfully");
  } catch (error) {
    res.status(500).send("Error creating monster");
  }
});

app.post('/createTransaction', async (req, res) => {
  try {
    const { transaction_id, user_id, item_id, transaction_type, amount, date } = req.body;
    await createTransaction(client, transaction_id, user_id, item_id, transaction_type, amount, date);
    res.status(201).send("Transaction created successfully");
  } catch (error) {
    res.status(500).send("Error creating transaction");
  }
});

app.post('/createWeapon', async (req, res) => {
  try {
    const { weapon_id, name, description, type, attributes, rarity } = req.body;
    await createWeapon(client, weapon_id, name, description, type, attributes, rarity);
    res.status(201).send("Weapon created successfully");
  } catch (error) {
    res.status(500).send("Error creating weapon");
  }
});


app.get('/findUserByUsername', async (req, res) => {
  try {
    const { username } = req.query; // Use req.query to get the username from the query string
    const user = await findUserByUsername(client, username);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("Error finding user by username");
  }
});

app.get('/findUserById', async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await findUserById(client, user_id);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Error finding user by ID");
  }
});

app.get('/existingUser', async (req, res) => {
  try {
    const { user_id } = req.body;
    const userExists = await existingUser(client, user_id);
    res.status(200).send(userExists);
  } catch (error) {
    res.status(500).send("Error checking existing user");
  }
}); 

app.get('/existingItem', async (req, res) => {
  try {
    const { item_id } = req.body;
    const itemExists = await existingItem(client, item_id);
    res.status(200).send(itemExists);
  } catch (error) {
    res.status(500).send("Error checking existing item");
  }
}); 

app.get('/existingMonster', async (req, res) => {
  try {
    const { monster_id } = req.body;
    const monsterExists = await existingMonster(client, monster_id);
    res.status(200).send(monsterExists);
  } catch (error) {
    res.status(500).send("Error checking existing monster");
  }
});

app.get('/existingWeapon', async (req, res) => {
  try {
    const { weapon_id } = req.body;
    const weaponExists = await existingWeapon(client, weapon_id);
    res.status(200).send(weaponExists);
  } catch (error) {
    res.status(500).send("Error checking existing weapon");
  }
}); 

app.post('/generateToken', async (req, res) => {
  try {
    const { user } = req.body;
    const token = await generateToken(user);
    res.status(200).send(token);
  } catch (error) {
    res.status(500).send("Error generating token");
  }
});

app.post('/monsterslain', async (req, res) => {
  try {
    const { monster_id } = req.body;
    await monsterslain(client, monster_id);
    res.status(200).send("Monster slain successfully");
  } catch (error) {
    res.status(500).send("Error slaying monster");
  }
}); 

app.delete('/deleteUser', async (req, res) => {
  try {
    const { user_id } = req.body; // Ensure user_id is sent in the body of the request
    if (!user_id) {
      return res.status(400).send("user_id is required");
    }
    await deleteUser(client, user_id);
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error("Error in /deleteUser:", error);
    res.status(500).send("Error deleting user");
  }
});


app.get('/reportUser', async (req, res) => {
  try {
    const { user_id } = req.query; // Use query parameters for GET requests
    if (!user_id) {
      return res.status(400).send("user_id is required");
    }
    const user = await reportUser(client, user_id);
    res.status(200).send(user);
  } catch (error) {
    console.error("Error in /reportUser:", error);
    res.status(500).send("Error reporting user");
  }
});


app.get('/viewLeaderboard', async (req, res) => {
  try {
    const leaderboard = await viewLeaderboard(client);
    res.status(200).send(leaderboard);
  } catch (error) {
    console.error("Error in /viewLeaderboard:", error);
    res.status(500).send("Error viewing leaderboard");
  }
});

app.get('/viewUserByAdmin', async (req, res) => {
  try {
    const { user_id } = req.query; // Use query parameters for GET requests
    if (!user_id) {
      return res.status(400).send("user_id is required");
    }
    const user = await viewUserByAdmin(client, user_id);
    res.status(200).send(user);
  } catch (error) {
    console.error("Error in /viewUserByAdmin:", error);
    res.status(500).send("Error viewing user by admin");
  }
});

/*app.get('/existingUser', async (req, res) => {
  try {
    const { user_id } = req.query;  // Extract user_id from the query string
    const userExists = await existingUser(client, user_id);  // Call the existingUser function
    if (userExists) {
      res.status(200).send(`User with ID ${user_id} exists.`);
    } else {
      res.status(404).send(`User with ID ${user_id} does not exist.`);
    }
  } catch (error) {
    console.error('Error in /existingUser route:', error);
    res.status(500).send('Internal server error');
  }
});

// (Other route handlers here)*/