const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
http.listen(PORT, () => console.log(`server listening on port ${PORT}!`));
