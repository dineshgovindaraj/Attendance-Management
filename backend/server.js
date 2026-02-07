const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
console.log('Adding a log message to trigger restart...');

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
