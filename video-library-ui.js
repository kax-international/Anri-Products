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
    getVideos,
    getComments,
    saveComment
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
const videoPlayer =
    document.getElementById("videoPlayer");

const infoVideoTitle =
    document.getElementById("infoVideoTitle");

const infoPlaylistSubtitle =
    document.getElementById("infoPlaylistSubtitle");

const infoUploader =
    document.getElementById("infoUploader");

const infoCreatedAt =
    document.getElementById("infoCreatedAt");
const commentList =
    document.getElementById("commentList");

const commentInput =
    document.getElementById("commentInput");

const saveCommentBtn =
    document.getElementById("saveCommentBtn");
const searchInput =
    document.getElementById("searchInput");
const videoList =
    document.getElementById("videoList");
/* ==========================================
   State
========================================== */

let currentUser = null;
let currentPlaylist = null;
let currentVideo = null;
let allVideos = [];           // 全動画
let currentSubtitle = "ALL";  // Subtitleフィルタ
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

    currentPlaylist = playlist;

    currentSubtitle = "All";

    renderSubtitleBar(
        playlist.subtitles || []
    );

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
   Video Player
========================================== */

function playVideo(video){
currentVideo = video;
    if(!video) return;

    /* -----------------------------
       Player
    ----------------------------- */

    videoPlayer.src =
        video.videoUrl;

    videoPlayer.load();

    /* autoplayしたいなら解除

    videoPlayer.play();

    */

    /* -----------------------------
       Information
    ----------------------------- */

    infoVideoTitle.textContent =
        video.videoTitle || "-";

    infoPlaylistSubtitle.textContent =
        video.playlistSubtitle || "-";

    infoUploader.textContent =
        video.ownerName || "-";

    if(video.createdAt?.toDate){

        infoCreatedAt.textContent =
            video.createdAt
                .toDate()
                .toLocaleString();

    }
    else{

        infoCreatedAt.textContent = "-";
    }
loadComments();
}
function renderSubtitleBar(subtitles){

    const subtitleBar =
        document.getElementById("subtitleBar");

    subtitleBar.innerHTML = "";

    // All
    const allBtn =
        document.createElement("button");

    allBtn.className = "subtitle-btn";
    allBtn.textContent = "All";

    allBtn.onclick = ()=>{

        currentSubtitle = "All";

        renderVideos();
    };

    subtitleBar.appendChild(allBtn);

    subtitles.forEach(sub=>{

        const btn =
            document.createElement("button");

        btn.className = "subtitle-btn";

        btn.textContent = sub;

        btn.onclick = ()=>{

            currentSubtitle = sub;

           renderVideos();
        };

        subtitleBar.appendChild(btn);

    });

}
function renderVideos(){

    videoList.innerHTML = "";

    const keyword =
        searchInput.value
        .trim()
        .toLowerCase();

    const filteredVideos =
        allVideos.filter(video=>{

            const matchTitle =
                (video.videoTitle || "")
                .toLowerCase()
                .includes(keyword);

            const matchSubtitle =
                currentSubtitle === "All" ||
                video.playlistSubtitle === currentSubtitle;

            return matchTitle && matchSubtitle;

        });

    if(filteredVideos.length===0){

        videoList.innerHTML =
            "<p>No Videos</p>";

        return;

    }

    filteredVideos.forEach(video=>{

        const card =
            document.createElement("div");

        card.className = "video-card";

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

            playVideo(video);

        };

        videoList.appendChild(card);

    });

    playVideo(filteredVideos[0]);

}
/* ==========================================
   Video List
========================================== */

async function loadVideos(playlistId){

    videoList.innerHTML =
        "<p>Loading...</p>";

try{

    allVideos =
        await getVideos(playlistId);

    renderVideos();

}
    catch(err){

        console.error(err);

        videoList.innerHTML =
            "<p>Load Failed</p>";

    }
}

/* ==========================================
   Comments
========================================== */

async function loadComments(){

    if(
        !currentPlaylist ||
        !currentVideo
    ){
        return;
    }

    commentList.innerHTML =
        "Loading...";

    try{

        const comments =
            await getComments(

                currentPlaylist.id,

                currentVideo.id

            );

        commentList.innerHTML = "";

        if(comments.length===0){

            commentList.innerHTML =
                "<p>No Comments</p>";

            return;

        }

        comments.forEach(comment=>{

            const div =
                document.createElement("div");

            div.style.marginBottom =
                "12px";

            div.style.padding =
                "10px";

            div.style.borderBottom =
                "1px solid #444";

            div.innerHTML = `

<strong>

${comment.userName}

</strong>

<br>

${comment.text}

`;

            commentList.appendChild(div);

        });

    }

    catch(err){

        console.error(err);

        commentList.innerHTML =
            "Load Failed";

    }

}
/* ==========================================
   Save Comment
========================================== */

saveCommentBtn.onclick =
async ()=>{

    if(
        !currentPlaylist ||
        !currentVideo
    ){
        return;
    }

    const text =
        commentInput.value.trim();

    if(!text){

        return;

    }

    try{

        await saveComment(

            currentPlaylist.id,

            currentVideo.id,

            currentUser,

            text

        );

        commentInput.value = "";

        await loadComments();

    }

    catch(err){

        console.error(err);

        alert(
            "Comment Save Failed"
        );

    }

};
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
searchInput.addEventListener("input", ()=>{

    renderVideos();

});
