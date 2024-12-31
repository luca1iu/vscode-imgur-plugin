const sharp = require('sharp')

sharp('images/icon.png')
  .resize(128, 128) // 确保尺寸是 128x128
  .png({
    quality: 60,
    compressionLevel: 9,
    palette: true, // 使用调色板来减少颜色数量
  })
  .toFile('images/icon.min.png')
  .then(() => {
    require('fs').renameSync('images/icon.min.png', 'images/icon.png')
    console.log('Icon compressed successfully!')
  })
  .catch((err) => console.error('Error compressing icon:', err))
