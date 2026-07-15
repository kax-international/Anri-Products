/* ==========================================
   upload-engine.js
   Athletic Cloud Upload Engine Ver2
========================================== */

import { uploadVideo }
from "./cloudinary.js";
import {

    savePlaylist,

    saveVideo

}
from "./firestore-upload.js";

/* ==========================================
   並列数
========================================== */

const MAX_PARALLEL = 5;

/* ==========================================
   Upload Start
========================================== */

export async function startUpload({

    playlistTitle,

    subtitles,

    videos,

    teamId,

    currentUser,

    onProgress,

    onFinish,

    onError

}){

    try{

        const playlistId =
            playlistTitle
            .trim()
            .toLowerCase()
            .replace(/\s+/g,"_");

        /* -----------------------------
           Playlist作成
        ----------------------------- */

        await savePlaylist({

            playlistId,

            title:playlistTitle,

            subtitles,

            teamId,

            currentUser

        });

        /* -----------------------------
           Queue
        ----------------------------- */

        const queue = [...videos];

        let uploaded = 0;

        let failed = 0;
async function worker(){

    while(queue.length){

        const item = queue.shift();

        try{

            status = `Uploading ${item.videoTitle}`;

            onProgress?.(
                uploaded,
                videos.length,
                item.videoTitle
            );

            // Cloudinary
            const cloudinary =
                await uploadVideo(item.file);

            // Firestore
            await saveVideo({

                playlistId,

                teamId,

                currentUser,

                playlistSubtitle:
                    item.playlistSubtitle,

                videoTitle:
                    item.videoTitle,

                cloudinary

            });

            uploaded++;

            onProgress?.(
                uploaded,
                videos.length,
                item.videoTitle
            );

        }

        catch(err){

            failed++;

            console.error(err);

        }

    }

}

        /* -----------------------------
           Worker生成
        ----------------------------- */

        const workers = [];

        for(

            let i=0;

            i<MAX_PARALLEL;

            i++

        ){

            workers.push(

                worker()

            );

        }

        await Promise.all(

            workers

        );

        onFinish?.({

            uploaded,

            failed,

            total:videos.length

        });

    }

    catch(err){

        console.error(err);

        onError?.(err);

    }

}
