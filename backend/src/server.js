const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Router API v1
const apiRouter = express.Router();
app.use('/api/v1', apiRouter);

// Health check
apiRouter.get('/', (req, res) => {
  res.json({ message: '42 Robotics API v1' });
});

// Import sub-routers here (TODO)
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/users', require('./routes/users'));
apiRouter.use('/projects', require('./routes/projects'));
apiRouter.use('/teams', require('./routes/teams'));
apiRouter.use('/submissions', require('./routes/submissions'));
apiRouter.use('/equipment', require('./routes/equipment'));
apiRouter.use('/achievements', require('./routes/achievements'));
apiRouter.use('/events', require('./routes/events'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;