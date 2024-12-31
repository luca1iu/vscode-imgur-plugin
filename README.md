## Original Author

This project is based on [@gavvvr/obsidian-imgur-plugin](https://github.com/gavvvr/obsidian-imgur-plugin).

original author: [@gavvvr](https://github.com/gavvvr)

origianl project works on Obsidian, this project works on VS Code.

# Imgur Uploader for VS Code

Automatically upload images to Imgur when pasting in Markdown files.

## Features

- Automatically detects image paste in Markdown files
- Uploads images to Imgur
- Supports both anonymous and authenticated uploads
- Shows upload status in the status bar

## Requirements

- VS Code 1.60.0 or higher
- An Imgur account (optional)
- Imgur Client ID

## Setup

1. Get your Imgur Client ID from https://api.imgur.com/oauth2/addclient
2. Open VS Code settings
3. Search for "Imgur"
4. Add your Client ID
5. (Optional) Enable authenticated uploads

## Usage

1. Copy an image to clipboard
2. Paste in a Markdown file
3. Choose "Yes" when prompted to upload to Imgur
4. The image link will be automatically inserted

## Imgur License

After creation, Client ID can be managed at: <https://imgur.com/account/settings/apps>

[^1]: You will only need to configure Client ID in Imgur plugin settings, secret is not required.

### Authenticated upload

Go to plugin's settings, select 'Authenticated Imgur upload' and complete authentication.
That's all! Now you are ready to make notes and upload all your images remotely.
You will see all your uploaded images at <https://your_login.imgur.com/all/>

### Anonymous upload

You might not want to see your Obsidian images tied to Imgur account.

For this case there is an 'Anonymous Imgur upload' option.

## FAQ

**Q:** How secure this approach is?  
**A:** Nobody sees your uploaded image unless you share a link or someone magically guesses an URL to your image.

**Q:** Can I remove a remote image uploaded by accident?  
**A:** For authenticated uploads - yes, go to <https://your_login.imgur.com/all/>,
for anonymous uploads - no
(it is technically possible, but you will need a `deleteHash` which is not recorded. I would record it, but there is no place for logging in Obsidian yet)

**Q:** For how long an image stays at imgur.com? Is there a chance to lose the data?  
**A:** For authenticated uploads, I guess they are never deleted. What about anonymous uploads?
Earlier it [was stated on Imgur website][early-imgur-guarantees] that the image you upload stays **forever**.
I think this is true [since 2015][imgur-pro-free]. Today I could not find this statement on Imgur website.
I can assume that images that did not receive any view for years, can be removed, but there is nothing to worry about.
You can read my detailed thoughts on this in [discussions][ttl-discussion]

[imgur-pro-free]: https://blog.imgur.com/2015/02/09/imgur-pro-for-everyone/
[early-imgur-guarantees]: https://webapps.stackexchange.com/questions/75993/how-long-does-imgur-store-uploaded-images/75994#75994
[ttl-discussion]: https://github.com/gavvvr/obsidian-imgur-plugin/discussions/4#discussioncomment-590286

**Q:** Imgur supports videos. Does the plugin support videos upload?  
**A:** No. Initially, I did not consider videos upload support since there is no Markdown syntax to embed videos.
On the other hand, you can simply use `<video>` HTML tag, so I will probably add support for videos in future

**Q:** Can it upload images to some other service?  
**A:** For now, there are no plans to support other image hosting solutions,
but it should not be difficult for you to make a fork and create your own implementation of `ImageUploader` interface.

### Discussion

If you have any questions/suggestions, consider using [GitHub Discussions][gh-discussions].

### Known limitations

- you can not paste animated gifs from the clipboard (they initially get copied as a static images to the clipboard).
  Use drag and drop instead if you want to upload an animated gif.
- there are [daily limits](https://apidocs.imgur.com/#rate-limits) for using Imgur API using associated with particular Client ID.

### Known issues

- Sometimes Imgur can reject your request to upload an image for no obvious reason.
  The error [usually reported in this case][known-cors-problem-issue] is a failed CORS request,
  which does not allow Obsidian to proceed with image upload. If you face this problem, no action required from your side:
  just wait, and it will disappear soon. Whenever the plugin fails to upload an image remotely,
  it will fall back to the default method of storing an image locally.

[known-cors-problem-issue]: https://github.com/gavvvr/obsidian-imgur-plugin/issues/8

### Contribution

Contributions are welcomed.
Check out the [DEVELOPMENT.md](DEVELOPMENT.md) to get started with the code.

### Your support

If this plugin is helpful to you, you can show your ❤️ by giving it a star ⭐️ on GitHub.
