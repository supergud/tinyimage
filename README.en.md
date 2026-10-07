# TinyImage 🖼️

[繁體中文](README.md) | English

An image compression and cropping tool. All processing happens in your browser, with batch processing, smart resizing, and file name cleanup.

Try it online: <https://tinyimage.eat2die.com>

## Features

### Compress / Resize
- Re-encodes images with Canvas to reduce file size (JPEG q0.82, PNG, WebP q0.8)
- Set a maximum edge length to scale down proportionally, never beyond the given size
- Set both width and height to fit the image inside that box (like `fit: inside`)
- Leave the size empty to compress only, keeping the original dimensions

### Crop & Compress
- Crop to an exact width and height (like `fit: cover`)
- Choose a crop anchor: center, any of the four edges, or any of the four corners

### More
- Batch processing, with original and output dimensions shown side by side
- Download file names include the actual output size (e.g. `photo_resized_2000x1333.jpg`)
- Special characters are stripped from file names, including Chinese file names
- Download everything at once as a ZIP
- Images are never uploaded to a server, so your files stay private
- Available in 繁體中文, English, 日本語, 한국어, Español and Português, with crop presets for local platforms

## Supported Formats

Any format your browser can decode works as input (JPEG · PNG · WebP · GIF · AVIF, etc.). Output: JPEG / PNG / WebP keep their original format; everything else is converted to JPEG.

## License

MIT
