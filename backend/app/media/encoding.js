const child_process = require('child_process');


exports.normalize = (imageFileName, outputFileName) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -y -i ${imageFileName} ${outputFileName}`;

    // Transcode
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Transcoding error. ${stderr}`));
      }
      resolve(outputFileName);
    });
  });
}