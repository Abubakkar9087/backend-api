import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// ✅ Load existing items from file (if exists)
let items = [];
let currentId = 1;

try {
  if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE);
    items = JSON.parse(rawData);
    // Set currentId based on max existing ID
    const maxId = items.reduce((max, item) => Math.max(max, item.id), 0);
    currentId = maxId + 1;
  }
} catch (err) {
  console.error('❌ Error reading data file:', err);
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

// ✅ POST: Create a new item with auto-incremented ID
app.post('/items', (req, res) => {
  const newItem = {
    id: currentId++, // auto-increment
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

// ✅ DELETE: Delete all items
app.delete('/items', (req, res) => {
  items = [];
  saveData();
  res.json({ success: true, message: 'All items deleted successfully' });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ API is running on http://localhost:${PORT}`);
});
