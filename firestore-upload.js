/* ==========================================
   firestore-upload.js
   Athletic Cloud Upload Ver2
========================================== */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    arrayUnion
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db }
from "./firebase.js";
/* ==========================================
   Playlist Save
========================================== */

export async function savePlaylist({

    playlistId,
    title,
    subtitles,
    teamId,
    currentUser

}){

    const playlistRef =
        doc(
            db,
            "playlists",
            playlistId
        );

    const snap =
        await getDoc(
            playlistRef
        );

    if(!snap.exists()){

        await setDoc(
            playlistRef,
            {

                teamId,

                title,

                subtitles,

                serviceType:"video",

                ownerUid:
                    currentUser.uid,

                ownerName:
                    currentUser.displayName ||
                    currentUser.email ||
                    "Unknown",

                createdAt:
                    serverTimestamp()

            }
        );

        return;

    }

    if(subtitles.length){

        await updateDoc(
            playlistRef,
            {

                subtitles:
                    arrayUnion(...subtitles)

            }
        );

    }

}

/* ==========================================
   Playlist Subtitle追加
========================================== */

export async function addPlaylistSubtitle(

    playlistId,

    subtitle

){

    if(!subtitle) return;

    const playlistRef =
        doc(
            db,
            "playlists",
            playlistId
        );

    await updateDoc(

        playlistRef,

        {

            subtitles:

                arrayUnion(subtitle)

        }

    );

}

/* ==========================================
   Save One Video
========================================== */

export async function saveVideo({

    playlistId,

    teamId,

    currentUser,

    cloudinary,

    playlistSubtitle,

    videoTitle

}){

    await addDoc(

        collection(

            db,

            "playlists",

            playlistId,

            "videos"

        ),

        {

            ownerUid:
                currentUser.uid,

            ownerName:
                currentUser.displayName ||
                currentUser.email ||
                "Unknown",

            teamId,

            playlistSubtitle,

            videoTitle,

            videoUrl:
                cloudinary.url,

            thumbnailUrl:
                cloudinary.thumbnail,

            publicId:
                cloudinary.publicId,

            assetId:
                cloudinary.assetId,

            duration:
                cloudinary.duration,

            bytes:
                cloudinary.bytes,

            width:
                cloudinary.width,

            height:
                cloudinary.height,

            format:
                cloudinary.format,

            createdAt:
                serverTimestamp()

        }

    );

}

/* ==========================================
   Get Playlist
========================================== */

export async function getPlaylist(

    playlistId

){

    const ref =

        doc(

            db,

            "playlists",

            playlistId

        );

    const snap =

        await getDoc(ref);

    if(!snap.exists()){

        return null;

    }

    return{

        id:snap.id,

        ...snap.data()

    };

}

/* ==========================================
   Check Playlist Exists
========================================== */

export async function playlistExists(

    playlistId

){

    const ref =

        doc(

            db,

            "playlists",

            playlistId

        );

    const snap =

        await getDoc(ref);

    return snap.exists();

}
