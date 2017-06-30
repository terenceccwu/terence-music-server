const express = require('express')
const fs = require('fs');
const ytdl = require('ytdl-core');

const logger = require('morgan')
const app = express()

app.use(logger('dev'))

var cache = {}

app.get('/', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');

  const vid = req.query.v
  const url = "https://www.youtube.com/watch?v=" + vid

  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : null;

    const opts = {range: {start: start, end: end}, filter: function(format) { return !format.bitrate && format.audioBitrate && format.container != 'webm'; }}
    var stream = ytdl(url, opts)
      .on('info', function (info, format) {
        var total = format.clen
        if(!end) end = total - 1
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'none', 'Content-Length': chunksize, 'Content-Type': format.type });
      })
      stream.pipe(res);
  } else {
    const opts = {filter: function(format) { return !format.bitrate && format.audioBitrate && format.audioEncoding == 'aac'; }}
    var stream = ytdl(url, opts)
      .on('info', function (info, format) {
        var total = format.clen
        console.log('ALL: ' + total);
        res.writeHead(200, { 'Content-Length': format.clen, 'Content-Type': format.type });
      })
    stream.pipe(res)
  }
 //  var path = 'test.m4a';
 // var stat = fs.statSync(path);
 // var total = stat.size;
 // if (req.headers['range']) {
 //   var range = req.headers.range;
 //   var parts = range.replace(/bytes=/, "").split("-");
 //   var partialstart = parts[0];
 //   var partialend = parts[1];
 //
 //   var start = parseInt(partialstart, 10);
 //   var end = partialend ? parseInt(partialend, 10) : total-1;
 //   var chunksize = (end-start)+1;
 //   console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
 //
 //   var file = fs.createReadStream(path, {start: start, end: end});
 //   res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
 //   file.pipe(res);
 // } else {
 //   console.log('ALL: ' + total);
 //   res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
 //   fs.createReadStream(path).pipe(res);
 // }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
