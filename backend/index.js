// index.js
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config();

const app = express(); // Create the express app here
const PORT = process.env.PORT || 3009;

// Connect to DB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('👓 Connected to DB')
    })
    .catch((error) => {
        console.log('Connection Error => : ', error.message)
    });

// Import routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const issueRoute = require('./routes/issues');
const teamRoute = require('./routes/teams');
const notificationRoute = require('./routes/notifications');
const commentRoute = require('./routes/comments');
const analyticRoute = require('./routes/analytics');
const moderationRoute = require('./routes/moderation');
const reportRoute = require('./routes/report');

// Increase parse limit
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

// Middleware
app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:9000'], // or whichever origins
    }),
);

app.use(express.json());
app.use(cookieParser());

// Simple route
app.get('/', (req, res) => {
    res.send('City Sense API Server is running!');
});

// Actual route mounting
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/issues', issueRoute);
app.use('/api/teams', teamRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/comments', commentRoute);
app.use('/api/analytics', analyticRoute);
app.use('/api/moderation', moderationRoute);
app.use('/api/report', reportRoute);

// Swagger config
const swaggerOptions = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CitySense API',
            version: '1.0.0',
            description: 'CitySense - Smart Urban Issue Reporting Platform'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token here.'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Export the app for testing (important!)
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🛺  API Server UP and Running at ${process.env.SERVER_URL}`));
}
