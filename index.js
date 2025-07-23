import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// Read data from file or initialize empty
let items = [];
if (fs.existsSync(DATA_FILE)) {
  items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Save data to file
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
};

// GET all items
app.get('/items', (req, res) => {
  res.json(items);
});

// POST new item
app.post('/items', (req, res) => {
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

// DELETE item by ID
app.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  items = items.filter(item => item.id !== id);
  saveData();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
