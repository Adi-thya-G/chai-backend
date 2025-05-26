import fs from "fs";

import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOncloudinary = async (localfilepath) => {
  try {
     if(!localfilepath)
      return null
    //upload file on cloudinary
    const res = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
      
    });

    //file as been upload successfuly
    console.log("file is upload on cloudinary", res);
    fs.unlinkSync(localfilepath)
    return res;
  } catch (error) {
    console.log("26",localfilepath)
    fs.unlinkSync(localfilepath); //remove file locally saved  temporary file as the upload operation failed
    return null;
  }
};

export { uploadOncloudinary };
