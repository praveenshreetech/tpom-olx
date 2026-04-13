import cloudinary from "./cloudinary"

export async function uploadImages(files, folder = "products") {
  const uploaded = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    uploaded.push(result.secure_url)
  }

  return uploaded
}