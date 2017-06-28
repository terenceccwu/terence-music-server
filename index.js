const express = require('express')
const fs = require('fs');
const ytdl = require('ytdl-core');

const app = express()

var cache = {}

app.get('/', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');

  const vid = req.query.v
  const url = "https://www.youtube.com/watch?v=" + vid

  if(cache[vid] && cache[vid].expire > Date.now() ) {
    res.redirect(cache[vid].url)
  } else {
    const opts = {filter: function(format) { return !format.bitrate && format.audioBitrate && format.audioEncoding == 'aac'; }}
    ytdl.getInfo(url)
    .then(info => ytdl.chooseFormat(info.formats,opts))
    .then(format => {
      cache[vid] = {url: format.url, expire: Date.now() + 1000 * 10} // expire in 3hr
      res.redirect(cache[vid].url)
    })
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
