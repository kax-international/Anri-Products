/* ==========================================
   video-library-ui.js
   Athletic Cloud Video Library Ver2
   Part 1
========================================== */

import { auth, db }
from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getPlaylists,
   getVideos
}
from "./firestore-video.js";

/* ==========================================
   URL
========================================== */

const params = new URLSearchParams(location.search);

const teamId = params.get("teamId");

/* ==========================================
   DOM
========================================== */

const playlistList =
    document.getElementById("playlistList");

/* ==========================================
   State
========================================== */

let currentUser = null;

let currentPlaylist = null;

/* ==========================================
   Permission
========================================== */

async function checkPermission(user){

    try{

        const snap =
            await getDoc(
                doc(
                    db,
                    "teams",
                    teamId
                )
            );

        if(!snap.exists()){

            alert("Team not found");

            location.href =
                "dashboard.html";

            return false;

        }

        const role =
            snap.data().members?.[user.uid];

        if(!role){

            alert("Permission denied");

            location.href =
                `team.html?teamId=${teamId}`;

            return false;

        }

        return true;

    }

    catch(err){

        console.error(err);

        alert("Permission check failed");

        location.href =
            `team.html?teamId=${teamId}`;

        return false;

    }

}

/* ==========================================
   Playlist UI
========================================== */

async function loadPlaylists(){

    playlistList.innerHTML =
        "<p>Loading...</p>";

    try{

        const playlists =
            await getPlaylists(teamId);
      const videoList =
    document.getElementById("videoList");

        playlistList.innerHTML = "";

        if(playlists.length===0){

            playlistList.innerHTML =
                "<p>No Playlist</p>";

            return;

        }

        playlists.forEach(playlist=>{

            const item =
                document.createElement("div");

            item.className =
                "playlist-item";

            item.innerHTML = `
                <strong>${playlist.title}</strong><br>
                <small>
                    ${
                        playlist.subtitles
                        ?.length || 0
                    } subtitles
                </small>
            `;

           item.onclick = async ()=>{

    currentPlaylist =
        playlist;

    await loadVideos(
        playlist.id
    );

};

            playlistList.appendChild(item);

        });

    }

    catch(err){

        console.error(err);

        playlistList.innerHTML =
            "<p>Load Failed</p>";

    }

}
/* ==========================================
   Video List
========================================== */

async function loadVideos(playlistId){

    videoList.innerHTML =
        "<p>Loading...</p>";

    try{

        const videos =
            await getVideos(playlistId);

        videoList.innerHTML = "";

        if(videos.length===0){

            videoList.innerHTML =
                "<p>No Videos</p>";

            return;

        }

        videos.forEach(video=>{

            const card =
                document.createElement("div");

            card.className =
                "video-card";

            card.innerHTML = `

<div class="video-title">

${video.videoTitle || "Untitled"}

</div>

<div class="video-subtitle">

${video.playlistSubtitle || "-"}

</div>

<div class="video-date">

${video.ownerName || ""}

</div>

`;

            card.onclick = ()=>{

                console.log(
                    "Video Selected",
                    video
                );

                // Part3で動画再生
            };

            videoList.appendChild(card);

        });

    }

    catch(err){

        console.error(err);

        videoList.innerHTML =
            "<p>Load Failed</p>";

    }

}
/* ==========================================
   Auth
========================================== */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            location.href =
                "login.html";

            return;

        }

        currentUser = user;

        const allow =
            await checkPermission(user);

        if(!allow){

            return;

        }

        await loadPlaylists();

    }

);
