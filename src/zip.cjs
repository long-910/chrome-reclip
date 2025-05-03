const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.resolve(__dirname, '../reclip-release.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
  console.log(`reclip-release.zip: ${archive.pointer()} total bytes`);
  console.log('Zip archive has been finalized.');
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);
archive.directory(path.resolve(__dirname, '../build/'), false);
archive.finalize(); 
