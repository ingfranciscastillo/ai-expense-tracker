import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  format: string
  width: number
  height: number
  bytes: number
}

export async function uploadToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "ai-expense-tracker",
          resource_type: "auto",
        },
        (error: unknown, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error)
            return
          }
          if (!result) {
            reject(new Error("Upload failed"))
            return
          }
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          })
        }
      )
      .end(buffer)
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      (error: unknown, result: unknown) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      }
    )
  })
}
