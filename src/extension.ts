import * as vscode from 'vscode'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
let statusBarItem: vscode.StatusBarItem

export function activate(context: vscode.ExtensionContext) {
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
  context.subscriptions.push(statusBarItem)

  // Register configuration change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (
        e.affectsConfiguration('imgurUploader.clientId') ||
        e.affectsConfiguration('imgurUploader.authenticated')
      ) {
        await verifyImgurAuth()
      }
    }),
  )

  // Initial verification
  verifyImgurAuth()

  // 监听粘贴事件
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'editor.action.clipboardPasteAction',
      async (editor) => {
        // 检查是否是 markdown 文件
        if (!editor.document.fileName.toLowerCase().endsWith('.md')) {
          // 如果不是 markdown 文件，执行默认的粘贴操作
          await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction')
          return
        }

        try {
          // 检查剪贴板中是否有图片
          const imageData = await getImageDataFromClipboard()
          if (imageData) {
            // 如果是图片，询问是否上传到 Imgur
            const choice = await vscode.window.showInformationMessage(
              'Would you like to upload this image to Imgur?',
              'Yes',
              'No',
            )

            if (choice === 'Yes') {
              const config = vscode.workspace.getConfiguration('imgurUploader')
              const clientId = config.get<string>('clientId')
              const authenticated = config.get<boolean>('authenticated') ?? false

              if (!clientId) {
                vscode.window.showErrorMessage(
                  'Imgur Client ID is not set. Please configure it in the settings.',
                )
                return
              }

              const imgurUrl = await uploadToImgur(imageData, clientId, authenticated)
              if (imgurUrl) {
                // 插入 Imgur 链接
                editor.edit((editBuilder) => {
                  editBuilder.insert(editor.selection.active, `![Image](${imgurUrl})`)
                })
                return
              }
            }
          }

          // 如果不是图片或用户选择不上传，执行默认的粘贴操作
          await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction')
        } catch (error: any) {
          console.error('Error handling paste:', error)
          // 出错时执行默认的粘贴操作
          await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction')
        }
      },
    ),
  )
}

async function verifyImgurAuth() {
  const config = vscode.workspace.getConfiguration('imgurUploader')
  const clientId = config.get<string>('clientId')
  const authenticated = config.get<boolean>('authenticated') ?? false

  if (!clientId) {
    statusBarItem.hide()
    return
  }

  try {
    const response = await fetch('https://api.imgur.com/3/account/me/images', {
      headers: {
        Authorization: authenticated ? `Bearer ${clientId}` : `Client-ID ${clientId}`,
      },
    })

    const data = await response.json()

    if (data.success && data.data) {
      const username = data.data.account_url || 'Anonymous'
      statusBarItem.text = `$(check) Imgur: ${username}`
      statusBarItem.tooltip = `Authenticated as: ${username}`
      statusBarItem.show()
    } else {
      statusBarItem.text = '$(alert) Imgur: Not authenticated'
      statusBarItem.tooltip = 'Click to configure Imgur settings'
      statusBarItem.show()
    }
  } catch (error: any) {
    statusBarItem.text = '$(alert) Imgur: Authentication failed'
    statusBarItem.tooltip = `Error: ${error?.message || 'Unknown error'}`
    statusBarItem.show()
  }
}

async function getImageDataFromClipboard(): Promise<string | null> {
  try {
    // 创建临时文件来保存图片
    const tempFile = require('os').tmpdir() + '/temp_' + Date.now() + '.png'
    let command: string

    if (process.platform === 'darwin') {
      // macOS - 使用更简单的命令
      command = `osascript -e '
        try
          set myFile to (POSIX file "${tempFile}")
          set someData to the clipboard as «class PNGf»
          set someFile to open for access myFile with write permission
          write someData to someFile
          close access someFile
          return true
        on error
          try
            close access myFile
          end try
          return false
        end try'`
    } else if (process.platform === 'win32') {
      // Windows
      command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; $img = [Windows.Forms.Clipboard]::GetImage(); if ($img) { $img.Save('${tempFile}', [System.Drawing.Imaging.ImageFormat]::Png) }"`
    } else {
      // Linux
      command = `xclip -selection clipboard -t image/png -o > "${tempFile}"`
    }

    await execAsync(command)

    // 读取临时文件并转换为 base64
    const fs = require('fs')
    if (fs.existsSync(tempFile)) {
      const imageBuffer = fs.readFileSync(tempFile)
      const base64Data = imageBuffer.toString('base64')

      // 清理临时文件
      fs.unlinkSync(tempFile)

      return base64Data
    }

    return null
  } catch (error: any) {
    console.error('Error reading clipboard:', error)
    if (error.message.includes("Can't make some data into the expected type")) {
      vscode.window.showErrorMessage('No image found in clipboard. Please copy an image first.')
    } else {
      vscode.window.showErrorMessage(`Failed to read image from clipboard: ${error.message}`)
    }
    return null
  }
}

async function uploadToImgur(
  imageData: string,
  clientId: string,
  authenticated: boolean,
): Promise<string | null> {
  try {
    console.log('Uploading image to Imgur...')

    // 添加更多调试信息
    console.log('Image data length:', imageData.length)
    console.log('First 100 chars of image data:', imageData.substring(0, 100))

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: authenticated ? `Bearer ${clientId}` : `Client-ID ${clientId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        type: 'base64',
        name: `image_${new Date().toISOString()}.png`,
        description: 'Uploaded from VS Code',
      }),
    })

    const data = await response.json()
    console.log('Imgur API Response:', data)

    if (data.success) {
      vscode.window.showInformationMessage('Image uploaded successfully!')
      return data.data.link
    } else {
      const errorMessage = data.data?.error || 'Unknown error'
      console.error('Upload failed:', errorMessage, data)
      vscode.window.showErrorMessage(`Failed to upload image to Imgur: ${errorMessage}`)
      return null
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    vscode.window.showErrorMessage(`Error uploading image: ${error?.message || 'Unknown error'}`)
    return null
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose()
  }
}
