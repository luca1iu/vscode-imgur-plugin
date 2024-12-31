# Imgur Uploader for VS Code

Automatically upload images to Imgur when pasting in Markdown files.

## Features

- One-click image upload to Imgur
- Paste image directly in Markdown files
- Anonymous upload support (50 uploads per hour)
- Shows upload status in the status bar

## Setup

1. Get your Imgur Client ID:

   - If you don't have an Imgur account, register at https://imgur.com/register
   - Go to https://api.imgur.com/oauth2/addclient
   - Fill in the following:
     - Application name: Any name (e.g., "VS Code Uploader")
     - Authorization type: Select "OAuth 2 authorization without a callback URL"
     - Email: Your email
     - Description: Optional
   - Click "Submit" to get your Client ID
   - Save the Client ID (you'll need it in the next step)

2. Configure VS Code:
   - Open VS Code settings (Cmd+, on Mac, Ctrl+, on Windows/Linux)
   - Search for "Imgur"
   - Paste your Client ID in the "Imgur Client ID" field

## Usage

1. Copy an image to clipboard
2. Open a Markdown file
3. Press Cmd+V (Mac) or Ctrl+V (Windows/Linux)
4. Click "Yes" when asked to upload to Imgur
5. The image link will be automatically inserted

## Rate Limits

This extension uses anonymous uploads to Imgur, which has the following limits:

- 50 uploads per hour
- No account required
- Images are not linked to your account
- Cannot delete uploaded images

## FAQ

**Q:** Can I use authenticated uploads?  
**A:** Currently, this extension only supports anonymous uploads for simplicity and reliability.

**Q:** What happens if I hit the rate limit?  
**A:** You'll need to wait until the next hour to upload more images.

**Q:** Can I delete uploaded images?  
**A:** Since we use anonymous uploads, images cannot be deleted. Please be careful what you upload.

**Q:** Is it secure?  
**A:** Images uploaded anonymously are only accessible to people who have the direct link.

## License

MIT

## Acknowledgments

This project is based on [@gavvvr/obsidian-imgur-plugin](https://github.com/gavvvr/obsidian-imgur-plugin).
