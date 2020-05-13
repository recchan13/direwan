const express = require('express');
const connectDB = require('./config/db');

const app = express();


connectDB();
app.get('/', (req, res) => res.send('API Running'));

// init middleware

app.use(express.json({ extended:false }));


// Define Route

app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
