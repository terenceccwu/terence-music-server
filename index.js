const express = require('express')
const fs = require('fs');
const ytdl = require('ytdl-core');

const app = express()

app.get('/', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');

  const url = "https://www.youtube.com/watch?v=" + req.query.v

  const opts = {filter: function(format) { return !format.bitrate && format.audioBitrate && format.audioEncoding == 'aac'; }}

  ytdl.getInfo(url)
    .then(info => ytdl.chooseFormat(info.formats,opts))
    .then(format => res.json(format))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
