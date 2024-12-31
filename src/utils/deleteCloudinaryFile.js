import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Name of your Cloudinary cloud (stored in environment variables)
    api_key: process.env.CLOUDINARY_API_KEY, // API key for authenticating with Cloudinary
    api_secret: process.env.CLOUDINARY_API_SECRET, // Secret key for authenticating with Cloudinary
});

const extractPublicIdFromUrl = (url) => {
    const regex = /\/upload\/(?:v\d+\/)?([^/.]+)(?=\.[a-z]+$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

const deleteCloudinaryFile = async (localfilePath) => {
    try {
        if (!localfilePath) {
            console.log("file is not found");
            return;
        }
        const public_id = extractPublicIdFromUrl(localfilePath);
        if(!public_id){
            console.log("public id is not found");
        };
        const result = await cloudinary.api.delete_resources(
            [public_id],
            { type: "upload", resource_type: "image" },
        );
        console.log("file is deleted in cloudinary", result);
    } catch (error) {
        console.log("file is not deleted from cloudinary", error.message || error);
    }
};

export {deleteCloudinaryFile};