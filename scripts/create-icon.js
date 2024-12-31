const fs = require('fs')
const { createCanvas } = require('canvas')

// 创建 128x128 的画布
const canvas = createCanvas(128, 128)
const ctx = canvas.getContext('2d')

// 设置背景为渐变色
const gradient = ctx.createLinearGradient(0, 0, 128, 128)
gradient.addColorStop(0, '#1bb76e') // Imgur 绿色
gradient.addColorStop(1, '#149956') // 深一点的绿色
ctx.fillStyle = gradient
ctx.fillRect(0, 0, 128, 128)

// 添加圆角矩形作为背景
ctx.beginPath()
ctx.roundRect(20, 20, 88, 88, 10)
ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
ctx.fill()

// 添加文字
ctx.fillStyle = '#ffffff'
ctx.font = 'bold 40px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('IMG', 64, 64)

// 确保 images 目录存在
if (!fs.existsSync('images')) {
  fs.mkdirSync('images')
}

// 保存为 PNG，使用最高压缩率
const buffer = canvas.toBuffer('image/png', {
  compressionLevel: 9,
  filters: canvas.PNG_ALL_FILTERS,
})
fs.writeFileSync('images/icon.png', buffer)

console.log('Icon created successfully!')
