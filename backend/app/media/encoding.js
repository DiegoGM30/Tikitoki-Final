const child_process = require('child_process');

exports.normalize = (inputFileName, outputFolder) => {
  return new Promise((resolve, reject) => {
    const outputManifest = `${outputFolder}/manifest.mpd`;
    const command = `
      ffmpeg -y -i ${inputFileName} \
      -map 0 -b:v:0 1000k -b:v:1 500k -s:v:1 640x360 \
      -c:v libx264 -c:a aac -f dash ${outputManifest}
    `;

    // Transcode to MPEG-DASH
    child_process.exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Transcoding error. ${stderr}`));
      }
      resolve(outputManifest);
    });
  });
};