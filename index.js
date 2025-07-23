import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// ✅ Generate unique ID using timestamp
const getNextId = () => Date.now();

// ✅ Load data from JSON file
let items = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    console.error('❌ Error reading data file:', err);
    items = [];
  }
}

// ✅ Save data to JSON file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('❌ Error writing data file:', err);
  }
};

// ✅ GET: Fetch all items
app.get('/items', (req, res) => {
  res.json(items);
});

// ✅ GET: Fetch a single item by ID
app.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  res.json(item);
});

// ✅ POST: Create a new item
app.post('/items', (req, res) => {
  const newItem = {
    id: getNextId(),
    ...req.body,
  };

  items.push(newItem);
  saveData();
  res.status(201).json(newItem);
});

// ✅ PUT: Update item by ID
app.put('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  items[index] = { ...items[index], ...req.body, id };
  saveData();
  res.json({ success: true, item: items[index] });
});

// ✅ DELETE: Delete a single item
app.delete('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  items.splice(index, 1);
  saveData();
  res.json({ success: true, message: 'Item deleted successfully' });
});

// ✅ DELETE: Delete ALL items
app.delete('/items', (req, res) => {
  items = [];
  saveData();
  res.json({ success: true, message: 'All items deleted successfully' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ API is running on http://localhost:${PORT}`);
});
