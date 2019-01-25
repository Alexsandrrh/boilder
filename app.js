const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config').server;
const app = express();

app.use(express.static(path.join(__dirname, '/dist')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Server');
});

app.listen(config.port, () => {
   console.log(`Server was started...\nIn http://localhost:${config.port}`);
});
