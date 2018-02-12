const express = require('express');
const multer  = require('multer');
const base62  = require('base62');
const gm      = require('gm').subClass({imageMagick: true})

const storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    const msFromEpoc = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    const uid = base62.encode(msFromEpoc * 1000 + rand);

    callback(null, uid);
  }
});

const upload = multer({
  storage : storage
}).single('photo');

const app = express();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/photos', function (req, res) {
  upload(req, res, function (err) {
    if (err || req.file === undefined) {
      console.error(err || 'file not sent');

      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end();
    }

    gm(req.file.path)
      .resize(720,720)
      .quality(75)
      .write(req.file.path, function (err) {
        if (err) {
          console.error(err);

          res.writeHead(500, { 'content-type': 'application/json' });
          return res.end();
        }

        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          id: req.file.filename
        }));
      });
  });
});

app.get('/photo/:photoId', function (req, res) {
  res.sendFile(__dirname + '/uploads/' + req.params.photoId);
});

app.listen(3000, function () {
  console.log('Working on port 3000');
});
