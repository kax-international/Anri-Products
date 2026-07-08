/* ==========================================
   firestore-video.js
   Athletic Cloud Video Library Ver2
========================================== */
import { db }
from "./firebase.js";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/* ==========================================
   Playlist List
========================================== */
export async function getPlaylists(teamId){
    const q = query(
        collection(db,"playlists"),
        where("teamId","==",teamId)
    );
    const snap = await getDocs(q);
    const playlists = [];
    snap.forEach(docSnap=>{
        playlists.push({
            id:docSnap.id,
            ...docSnap.data()
        });
    });
    return playlists;
}
/* ==========================================
   Playlist Info
========================================== */
export async function getPlaylist(playlistId){
    const snap = await getDoc(
        doc(db,"playlists",playlistId)
    );
    if(!snap.exists()){
        return null;
    }
    return {
        id:snap.id,
        ...snap.data()
    };
}
/* ==========================================
   Videos
========================================== */
export async function getVideos(playlistId){
    const snap = await getDocs(
        query(
            collection(
                db,
                "playlists",
                playlistId,
                "videos"
            ),
            orderBy("createdAt","asc")
        )
    );
    const videos = [];
    snap.forEach(docSnap=>{
        videos.push({
            id:docSnap.id,
            ...docSnap.data()
        });
    });
    return videos;
}
/* ==========================================
   Comments
========================================== */
export async function getComments(
    playlistId,
    videoId
){
    const snap = await getDocs(
        query(
            collection(
                db,
                "playlists",
                playlistId,
                "videos",
                videoId,
                "comments"
            ),

            orderBy("createdAt","asc")

        )

    );

    const comments = [];

    snap.forEach(docSnap=>{

        comments.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    return comments;

}


/* ==========================================
   Save Comment
========================================== */

export async function saveComment(

    playlistId,

    videoId,

    currentUser,

    text

){

    if(!text.trim()) return;

    await addDoc(

        collection(

            db,

            "playlists",

            playlistId,

            "videos",

            videoId,

            "comments"

        ),

        {

            text,

            uid:

                currentUser.uid,

            userName:

                currentUser.displayName ||

                currentUser.email ||

                "Unknown",

            createdAt:

                serverTimestamp()

        }

    );

}


/* ==========================================
   Playlist Subtitle
========================================== */

export async function getPlaylistSubtitles(

    playlistId

){

    const playlist =

        await getPlaylist(

            playlistId

        );

    if(!playlist){

        return [];

    }

    return playlist.subtitles || [];

}
