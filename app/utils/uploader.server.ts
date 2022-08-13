import type { UploadHandler } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  writeAsyncIterableToWritable,
} from "@remix-run/node";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  uploadFolder: string
): Promise<any> {
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: `${process.env.CLOUDINARY_API_FOLDER}/${uploadFolder}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });

  return uploadPromise;
}

export const getUploadHandler = (
  handlerType: "product" | "category"
): UploadHandler => {
  const uploadHandler: UploadHandler = composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== "image") {
        return undefined;
      }

      const uploadFolder = handlerType === "category" ? "categories" : "";

      const uploadedImage: any = await uploadImage(data, uploadFolder);
      return JSON.stringify({
        secureUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      });
    },
    createMemoryUploadHandler()
  );

  return uploadHandler;
};

const uploadHandler: UploadHandler = composeUploadHandlers(
  async ({ name, contentType, data, filename }) => {
    if (name !== "image") {
      return undefined;
    }

    const uploadedImage: any = await uploadImage(data, "");
    return JSON.stringify({
      secureUrl: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    });
  },
  createMemoryUploadHandler()
);

const deleteImage = (publicId: string) => {
  cloudinary.v2.uploader.destroy(publicId, function (error, result) {});
};

export { uploadImage, uploadHandler, deleteImage };
