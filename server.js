const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for deployment

// Connect to MongoDB using a cloud-based service (replace connection string with your MongoDB Atlas connection string)
mongoose.connect('your-mongodb-atlas-connection-string', { useNewUrlParser: true, useUnifiedTopology: true });

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define a MongoDB schema for notes
const noteSchema = new mongoose.Schema({
  note: String,
  image: String,
});

// Create a model based on the schema
const Note = mongoose.model('Note', noteSchema);

// Middleware to serve static files from the public directory
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve images

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Route to serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/notes', upload.single('image'), async (req, res) => {
  try {
    const newNote = new Note({
      note: req.body.note,
      image: req.file.filename,
    });

    await newNote.save();

    // Send a success response
    res.json({ success: true, message: 'Note and image uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();

    res.json(notes);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
