const fs = require('fs')
const { createCanvas } = require('canvas')

// 创建 128x128 的画布
const canvas = createCanvas(128, 128)
const ctx = canvas.getContext('2d')

// 设置背景色为 Imgur 的绿色
ctx.fillStyle = '#1bb76e'
ctx.fillRect(0, 0, 128, 128)

// 添加文字
ctx.fillStyle = '#ffffff'
ctx.font = 'bold 48px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('IMG', 64, 64)

// 确保 images 目录存在
if (!fs.existsSync('images')) {
  fs.mkdirSync('images')
}

// 保存为 PNG
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync('images/icon.png', buffer)

console.log('Icon created successfully!')
