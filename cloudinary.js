/* ==========================================
   cloudinary.js
   Athletic Cloud
========================================== */

const CLOUD_NAME = "dxvgp89ma";
const UPLOAD_PRESET = "AthleticCloud";

/* ==========================================
   Upload One Video
========================================== */

export async function uploadVideo(file){

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );

    const response =
        await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,

            {

                method:"POST",

                body:formData

            }

        );

    const data =
        await response.json();

    if(!response.ok){

        console.error(data);

        throw new Error(

            data.error?.message ||

            "Cloudinary Upload Failed"

        );

    }

    return{

        url:
            data.secure_url,

        publicId:
            data.public_id,

        assetId:
            data.asset_id,

        duration:
            data.duration,

        bytes:
            data.bytes,

        width:
            data.width,

        height:
            data.height,

        format:
            data.format,

        createdAt:
            data.created_at,

        thumbnail:

            data.secure_url.replace(

                "/upload/",

                "/upload/so_0/"

            ) + ".jpg"

    };

}
