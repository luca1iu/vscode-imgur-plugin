"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let statusBarItem;
function activate(context) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    context.subscriptions.push(statusBarItem);
    // Register configuration change listener
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('imgurUploader.clientId') ||
            e.affectsConfiguration('imgurUploader.authenticated')) {
            await verifyImgurAuth();
        }
    }));
    // Initial verification
    verifyImgurAuth();
    // 监听粘贴事件
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('editor.action.clipboardPasteAction', async (editor) => {
        // 检查是否是 markdown 文件
        if (!editor.document.fileName.toLowerCase().endsWith('.md')) {
            // 如果不是 markdown 文件，执行默认的粘贴操作
            await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
            return;
        }
        try {
            // 检查剪贴板中是否有图片
            const imageData = await getImageDataFromClipboard();
            if (imageData) {
                // 如果是图片，询问是否上传到 Imgur
                const choice = await vscode.window.showInformationMessage('Would you like to upload this image to Imgur?', 'Yes', 'No');
                if (choice === 'Yes') {
                    const config = vscode.workspace.getConfiguration('imgurUploader');
                    const clientId = config.get('clientId');
                    const authenticated = config.get('authenticated') ?? false;
                    if (!clientId) {
                        vscode.window.showErrorMessage('Imgur Client ID is not set. Please configure it in the settings.');
                        return;
                    }
                    const imgurUrl = await uploadToImgur(imageData, clientId, authenticated);
                    if (imgurUrl) {
                        // 插入 Imgur 链接
                        editor.edit((editBuilder) => {
                            editBuilder.insert(editor.selection.active, `![Image](${imgurUrl})`);
                        });
                        return;
                    }
                }
            }
            // 如果不是图片或用户选择不上传，执行默认的粘贴操作
            await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
        }
        catch (error) {
            console.error('Error handling paste:', error);
            // 出错时执行默认的粘贴操作
            await vscode.commands.executeCommand('default:editor.action.clipboardPasteAction');
        }
    }));
}
exports.activate = activate;
async function verifyImgurAuth() {
    const config = vscode.workspace.getConfiguration('imgurUploader');
    const clientId = config.get('clientId');
    const authenticated = config.get('authenticated') ?? false;
    console.log('Verifying Imgur auth:', {
        clientId: clientId?.substring(0, 5) + '...',
        authenticated,
    });
    if (!clientId) {
        statusBarItem.hide();
        return;
    }
    try {
        const response = await fetch('https://api.imgur.com/3/credits', {
            headers: {
                Authorization: authenticated ? `Bearer ${clientId}` : `Client-ID ${clientId}`,
            },
        });
        const data = await response.json();
        console.log('Auth check response:', data);
        if (data.success) {
            const credits = data.data;
            statusBarItem.text = `$(check) Imgur: ${credits.UserRemaining}/${credits.UserLimit} uploads left`;
            statusBarItem.tooltip = `Client uploads: ${credits.ClientRemaining}/${credits.ClientLimit}`;
            statusBarItem.show();
        }
        else {
            statusBarItem.text = '$(alert) Imgur: Auth error';
            statusBarItem.tooltip = data.data?.error || 'Unknown error';
            statusBarItem.show();
        }
    }
    catch (error) {
        console.error('Auth check error:', error);
        statusBarItem.text = '$(alert) Imgur: Error';
        statusBarItem.tooltip = error.message;
        statusBarItem.show();
    }
}
async function getImageDataFromClipboard() {
    try {
        // 创建临时文件来保存图片
        const tempFile = require('os').tmpdir() + '/temp_' + Date.now() + '.png';
        let command;
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
        end try'`;
        }
        else if (process.platform === 'win32') {
            // Windows
            command = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; $img = [Windows.Forms.Clipboard]::GetImage(); if ($img) { $img.Save('${tempFile}', [System.Drawing.Imaging.ImageFormat]::Png) }"`;
        }
        else {
            // Linux
            command = `xclip -selection clipboard -t image/png -o > "${tempFile}"`;
        }
        await execAsync(command);
        // 读取临时文件并转换为 base64
        const fs = require('fs');
        if (fs.existsSync(tempFile)) {
            const imageBuffer = fs.readFileSync(tempFile);
            const base64Data = imageBuffer.toString('base64');
            // 清理临时文件
            fs.unlinkSync(tempFile);
            return base64Data;
        }
        return null;
    }
    catch (error) {
        console.error('Error reading clipboard:', error);
        if (error.message.includes("Can't make some data into the expected type")) {
            vscode.window.showErrorMessage('No image found in clipboard. Please copy an image first.');
        }
        else {
            vscode.window.showErrorMessage(`Failed to read image from clipboard: ${error.message}`);
        }
        return null;
    }
}
async function uploadToImgur(imageData, clientId, authenticated) {
    try {
        console.log('Uploading image to Imgur...');
        console.log('Auth mode:', authenticated ? 'Authenticated' : 'Anonymous');
        console.log('Client ID length:', clientId.length);
        console.log('Image data length:', imageData.length);
        // 测试 Client ID 是否有效
        const creditsResponse = await fetch('https://api.imgur.com/3/credits', {
            headers: {
                Authorization: `Client-ID ${clientId}`,
            },
        });
        const creditsData = await creditsResponse.json();
        console.log('Credits check:', creditsData);
        if (!creditsData.success) {
            throw new Error('Invalid Client ID');
        }
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
        });
        if (response.status === 429) {
            const errorText = await response.text();
            console.error('Rate limit error:', errorText);
            const remainingTime = response.headers.get('X-RateLimit-Reset');
            const message = remainingTime
                ? `Rate limit reached. Reset in ${new Date(parseInt(remainingTime) * 1000).toLocaleTimeString()}`
                : 'Rate limit reached. Please try again later';
            vscode.window.showErrorMessage(message);
            return null;
        }
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Imgur API Error:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText,
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }
        const data = await response.json();
        console.log('Imgur API Response:', data);
        if (data.success) {
            vscode.window.showInformationMessage('Image uploaded successfully!');
            return data.data.link;
        }
        else {
            throw new Error(data.data?.error || 'Unknown error');
        }
    }
    catch (error) {
        console.error('Upload error:', error);
        vscode.window.showErrorMessage(`Failed to upload image to Imgur: ${error.message}`);
        return null;
    }
}
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map