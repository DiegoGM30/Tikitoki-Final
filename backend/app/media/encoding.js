// backend/app/media/encoding.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

/**
 * Normalizes video to MPEG-DASH format using fluent-ffmpeg.
 * @param {string} inputPath - The path to the input video file.
 * @param {string} outputDir - The directory where DASH files will be saved.
 * @returns {Promise<string>} A promise that resolves with the path to the manifest file.
 */
exports.normalize = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const manifestName = 'manifest.mpd';
    const manifestPath = path.join(outputDir, manifestName);

    const command = ffmpeg(inputPath)
      .outputOptions([
        // Video stream 0: 360p
        '-map 0:v:0', // Asegúrate que el video de entrada tiene al menos un stream de video
        '-c:v:0 libx264',
        '-b:v:0 500k',
        '-s:v:0 640x360',
        '-preset:v:0 medium',
        '-profile:v:0 main',
        // '-tier:v:0 main', // Tier puede ser opcional o causar problemas en algunas versiones/builds
        '-level:v:0 3.1',

        // Video stream 1: 240p
        '-map 0:v:0', // Mapea el mismo stream de video de entrada para la segunda representación
        '-c:v:1 libx264',
        '-b:v:1 300k',
        '-s:v:1 426x240',
        '-preset:v:1 medium',
        '-profile:v:1 main',
        // '-tier:v:1 main',
        '-level:v:1 3.0',

        // Audio stream
        '-map 0:a:0?', // El '?' lo hace opcional, si no hay audio, no fallará
        '-c:a:0 aac',
        '-b:a:0 64k',
        '-ac:a:0 2', // Audio estéreo

        // DASH options - generales
        '-f dash',
        '-seg_duration 5',        // Duración del segmento en segundos
        '-use_template 1',        // Usar plantillas para nombres de segmento
        '-use_timeline 1',        // Usar timeline en los segmentos
        '-init_seg_name init-stream$RepresentationID$.m4s',
        '-media_seg_name chunk-stream$RepresentationID$-$Number%05d$.m4s',
        // La opción -adaptation_sets se añade explícitamente abajo
      ])
      // Añadir -adaptation_sets explícitamente.
      // El valor es una cadena única que FFmpeg interpretará.
      .outputOption('-adaptation_sets', 'id=0,streams=v id=1,streams=a')
      .output(manifestPath)
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('end', () => {
        console.log('MPEG-DASH manifest generated successfully at:', manifestPath);
        resolve(manifestPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg Error:', err.message);
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error('Video transcoding to DASH failed: ' + err.message));
      });
      
    command.run();
  });
};
