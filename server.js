const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { PeerServer } = require('peer');

const peerServer = PeerServer({ port: 9000, path: '/myapp' });

const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room, portId: port });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnect', userId);
    });
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
