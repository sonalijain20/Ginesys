// Load environment variables
require('dotenv').config();

const express = require('express');
const app = express();

// Import route handlers
const authRoutes = require("./routes/authRoutes");
const dogRoutes = require("./routes/dogRoutes");

const port = process.env.PORT || 3000;

app.use(express.json());

// Route handler for authentication endpoints
app.use('/api/auth', authRoutes);

// Route handler for dog images endpoints
app.use('/api/dogs', dogRoutes);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

// Start the Express server
app.listen(port, () => console.log(`Server up and running on port ${port}`));