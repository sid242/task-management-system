const express = require('express');
require('dotenv').config();
require('./config/db');
const app = express();
var cors = require('cors');
const { routeNotFound, errorHandler } = require('./middleware/errorMiddleware');
const port = process.env.API_PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Task Management');
});

app.use('/api/auth', require('./routes/auth.router'));
app.use('/api/project', require('./routes/project.router'));
app.use('/api/task', require('./routes/task.router'));

app.use(routeNotFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`listening at port no ${port}`);
});
