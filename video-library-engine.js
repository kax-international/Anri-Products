/* ==========================================
   video-library-engine.js
   Athletic Cloud Video Library Engine Ver2
========================================== */

import {

    getPlaylists,
    getPlaylistSubtitles,
    getVideos,
    getComments,
    saveComment

}
from "./firestore-video.js";


/* ==========================================
   State
========================================== */

let playlists = [];

let currentPlaylist = null;

let currentVideo = null;

let allVideos = [];

let filteredVideos = [];

let playlistSubtitles = [];


/* ==========================================
   UI Elements
========================================== */

const playlistList =
    document.getElementById("playlistList");

const subtitleBar =
    document.getElementById("subtitleBar");

const searchInput =
    document.getElementById("searchInput");

const videoList =
    document.getElementById("videoList");

const player =
    document.getElementById("videoPlayer");

const commentList =
    document.getElementById("commentList");

const commentInput =
    document.getElementById("commentInput");

const saveCommentBtn =
    document.getElementById("saveCommentBtn");


/* ==========================================
   Load Playlist List
========================================== */

export async function loadPlaylists(teamId){

    playlists =
        await getPlaylists(teamId);

    playlistList.innerHTML = "";

    playlists.forEach(playlist=>{

        const div =
            document.createElement("div");

        div.className =
            "playlist";

        div.textContent =
            playlist.title;

        div.onclick = ()=>{

            selectPlaylist(
                playlist.id
            );

        };

        playlistList.appendChild(div);

    });

}


/* ==========================================
   Select Playlist
========================================== */

export async function selectPlaylist(

    playlistId

){

    currentPlaylist = playlistId;

    playlistSubtitles =
        await getPlaylistSubtitles(
            playlistId
        );

    allVideos =
        await getVideos(
            playlistId
        );

    filteredVideos =
        [...allVideos];

    createSubtitleButtons();

    renderVideos(filteredVideos);

}


/* ==========================================
   Subtitle Buttons
========================================== */

function createSubtitleButtons(){

    subtitleBar.innerHTML = "";

    // ALL

    const allBtn =
        document.createElement("button");

    allBtn.textContent =
        "All";

    allBtn.onclick = ()=>{

        filteredVideos =
            [...allVideos];

        renderVideos(
            filteredVideos
        );

    };

    subtitleBar.appendChild(
        allBtn
    );

    playlistSubtitles.forEach(sub=>{

        const btn =
            document.createElement("button");

        btn.textContent =
            sub;

        btn.onclick = ()=>{

            filteredVideos =
                allVideos.filter(v=>

                    v.playlistSubtitle === sub

                );

            renderVideos(
                filteredVideos
            );

        };

        subtitleBar.appendChild(btn);

    });

}


/* ==========================================
   Search
========================================== */

export function setupSearch(){

    if(!searchInput){

        return;

    }

    searchInput.addEventListener(

        "input",

        ()=>{

            const keyword =
                searchInput.value
                .trim()
                .toLowerCase();

            if(!keyword){

                renderVideos(
                    filteredVideos
                );

                return;

            }

            const result =
                filteredVideos.filter(v=>{

                    return (

                        (v.videoTitle||"")

                        .toLowerCase()

                        .includes(keyword)

                    );

                });

            renderVideos(result);

        }

    );

}


/* ==========================================
   Render Videos
   （Part2で続き）
========================================== */

export function renderVideos(){

    // Part2

}
/* ==========================================
   Render Videos
========================================== */

export function renderVideos(videos){

    videoList.innerHTML = "";

    if(!videos || videos.length===0){

        videoList.innerHTML = `
            <div
                style="
                    padding:30px;
                    color:#888;
                ">
                No Videos
            </div>
        `;

        return;
    }

    videos.forEach(video=>{

        const card =
            document.createElement("div");

        card.className =
            "video-card";

        card.innerHTML = `

            <div
                style="
                    font-size:16px;
                    font-weight:bold;
                    margin-bottom:8px;
                ">
                ${video.videoTitle || "Untitled"}
            </div>

            <div
                style="
                    font-size:13px;
                    color:#aaa;
                ">
                ${video.playlistSubtitle || "-"}
            </div>

        `;

        card.onclick = ()=>{

            playVideo(video);

        };

        videoList.appendChild(card);

    });

}


/* ==========================================
   Play Video
========================================== */

async function playVideo(video){

    currentVideo = video;

    player.pause();

    player.src = "";

    player.src = video.videoUrl;

    player.load();

    try{

        await player.play();

    }

    catch(e){

        console.log(e);

    }

    await loadCommentList();

}


/* ==========================================
   Load Comment List
========================================== */

async function loadCommentList(){

    commentList.innerHTML = "";

    if(!currentPlaylist){

        return;

    }

    if(!currentVideo){

        return;

    }

    const comments =
        await getComments(

            currentPlaylist,

            currentVideo.id

        );

    if(comments.length===0){

        commentList.innerHTML = `

            <div
                style="
                    color:#777;
                    padding:10px;
                ">

                No Comments

            </div>

        `;

        return;

    }

    comments.forEach(comment=>{

        const box =
            document.createElement("div");

        box.style.background =
            "#222";

        box.style.marginBottom =
            "8px";

        box.style.padding =
            "10px";

        box.style.borderRadius =
            "8px";

        const date =

            comment.createdAt?.toDate

            ? comment.createdAt.toDate()

            : null;

        const dateText =

            date

            ? date.toLocaleString()

            : "";

        box.innerHTML = `

            <div
                style="
                    font-size:13px;
                    color:#aaa;
                    margin-bottom:4px;
                ">

                ${comment.userName || "Unknown"}

            </div>

            <div
                style="
                    white-space:pre-wrap;
                ">

                ${comment.text}

            </div>

            <div
                style="
                    font-size:11px;
                    color:#666;
                    margin-top:6px;
                ">

                ${dateText}

            </div>

        `;

        commentList.appendChild(box);

    });

}
/* ==========================================
   Update Video Information
========================================== */

function updateVideoInfo(video){

    document.getElementById("infoVideoTitle").textContent =
        video.videoTitle || "-";

    document.getElementById("infoPlaylistSubtitle").textContent =
        video.playlistSubtitle || "-";

    document.getElementById("infoUploader").textContent =
        video.ownerName ||
        video.ownerUid ||
        "-";

    let created = "-";

    if(video.createdAt?.toDate){

        created =
            video.createdAt
                .toDate()
                .toLocaleString();

    }

    document.getElementById("infoCreatedAt").textContent =
        created;

}


/* ==========================================
   Play Video (Update)
========================================== */

async function playVideo(video){

    currentVideo = video;

    player.pause();

    player.src = "";

    player.src = video.videoUrl;

    player.load();

    try{

        await player.play();

    }

    catch(err){

        console.log(err);

    }

    updateVideoInfo(video);

    await loadCommentList();

}


/* ==========================================
   Save Comment
========================================== */

export async function postComment(currentUser){

    if(!currentPlaylist) return;

    if(!currentVideo) return;

    const text =
        commentInput.value.trim();

    if(!text){

        alert("Comment is empty.");

        return;

    }

    await saveComment(

        currentPlaylist,

        currentVideo.id,

        currentUser,

        text

    );

    commentInput.value = "";

    await loadCommentList();

}


/* ==========================================
   Comment Button
========================================== */

export function setupCommentButton(currentUser){

    saveCommentBtn.onclick = async ()=>{

        try{

            await postComment(currentUser);

        }

        catch(err){

            console.error(err);

            alert("Failed to save comment.");

        }

    };

}
/* ==========================================
   Initial Playlist
========================================== */

async function loadFirstPlaylist(teamId){

    await loadPlaylists(teamId);

    if(playlists.length===0){

        videoList.innerHTML = `
            <div
                style="
                    padding:30px;
                    color:#888;
                ">
                No Playlist
            </div>
        `;

        return;

    }

    await selectPlaylist(
        playlists[0].id
    );

}


/* ==========================================
   Init
========================================== */

export async function init(

    teamId,

    currentUser

){

    try{

        await loadFirstPlaylist(
            teamId
        );

        setupSearch();

        setupCommentButton(
            currentUser
        );

    }

    catch(err){

        console.error(err);

        alert(
            "Failed to load Video Library."
        );

    }

}


/* ==========================================
   Refresh Current Playlist
========================================== */

export async function refreshCurrentPlaylist(){

    if(!currentPlaylist){

        return;

    }

    await selectPlaylist(
        currentPlaylist
    );

}


/* ==========================================
   Get Current Playlist
========================================== */

export function getCurrentPlaylist(){

    return currentPlaylist;

}


/* ==========================================
   Get Current Video
========================================== */

export function getCurrentVideo(){

    return currentVideo;

}


/* ==========================================
   Search Reset
========================================== */

export function clearSearch(){

    if(searchInput){

        searchInput.value = "";

    }

    renderVideos(
        filteredVideos
    );

}


/* ==========================================
   Subtitle Reset
========================================== */

export function showAllVideos(){

    filteredVideos = [...allVideos];

    renderVideos(
        filteredVideos
    );

}


/* ==========================================
   Reload Comments
========================================== */

export async function refreshComments(){

    if(

        !currentPlaylist ||

        !currentVideo

    ){

        return;

    }

    await loadCommentList();

}


/* ==========================================
   Reload Videos
========================================== */

export async function refreshVideos(){

    if(!currentPlaylist){

        return;

    }

    allVideos =
        await getVideos(
            currentPlaylist
        );

    filteredVideos =
        [...allVideos];

    renderVideos(
        filteredVideos
    );

}


/* ==========================================
   Engine Ready
========================================== */

console.log(
    "Video Library Engine Loaded"
);
