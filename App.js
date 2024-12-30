// Import required modules
require('dotenv').config();  // To load environment variables from the .env file
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');  // Import the Sequelize connection
const bodyParser = require('body-parser');  // For parsing incoming request bodies
const path = require('path');
 const adminRoute = require('./routes/adminRoute');
 const contestantListRoute = require('./routes/contestantRoutes');
 const inviteRoute = require('./routes/inviteRoute');
 const authRoute = require('./routes/authRoute');
 const subUserRoute = require('./routes/subRoute');
 const contestRoute = require('./routes/contestRoute'); // Import the contest routes

// const dpRoute = require('./routes/dpRoutes');
// const profileRoute = require('./routes/profileRoutes');
// const categoryRoutes = require('./routes/bookingRoutes');
// const fileRoutes = require('./routes/FileRoute');


// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());  // To allow cross-origin requests
app.use(bodyParser.json());  // Parse incoming JSON requests


//app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
// Define a basic route




// app.use('/apis', categoryRoutes);

 app.use('/apis', adminRoute);
 app.use('/apis', authRoute);
 app.use('/apis', inviteRoute);
 app.use('/apis', contestRoute);
 app.use('/apis', contestantListRoute);
 app.use('/apis', subUserRoute);

// app.use('/apis', dpRoute);
// app.use('/apis', profileRoute);
// app.use('/apis', fileRoutes);



// Sync the database and start the server
sequelize.sync()
  .then(() => {
    // Start the server on the port defined in .env or default to 3000
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

