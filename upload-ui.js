import { startUpload }
from "./upload-engine.js";
import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const auth = getAuth();
const currentUser = auth.currentUser;
/* ==========================================
   Athletic Cloud Upload UI
========================================== */

const subtitleContainer =
    document.getElementById("subtitleContainer");

const addSubtitleBtn =
    document.getElementById("addSubtitleBtn");

const addVideoBtn =
    document.getElementById("addVideoBtn");

const videoQueue =
    document.getElementById("videoQueue");

const uploadBtn =
    document.getElementById("uploadBtn");
const params =
    new URLSearchParams(location.search);

const teamId =
    params.get("teamId");


/* ==========================================
   Playlist Subtitle取得
========================================== */

function getPlaylistSubtitles(){

    const subtitles = [];

    document
        .querySelectorAll(".subtitle-box")
        .forEach(input=>{

            const value = input.value.trim();

            if(value){

                subtitles.push(value);

            }

        });

    return subtitles;

}


/* ==========================================
   Select更新
========================================== */

function refreshSubtitleSelects(){

    const subtitles =
        getPlaylistSubtitles();

    document
        .querySelectorAll(".playlistSubtitleSelect")
        .forEach(select=>{

            const current =
                select.value;

            select.innerHTML = "";

            subtitles.forEach(sub=>{

                const option =
                    document.createElement("option");

                option.value = sub;

                option.textContent = sub;

                select.appendChild(option);

            });

            if(subtitles.includes(current)){

                select.value = current;

            }

        });

}


/* ==========================================
   Subtitle追加
========================================== */

addSubtitleBtn.onclick = ()=>{

    const input =
        document.createElement("input");

    input.className =
        "subtitle-box";

    input.placeholder =
        "Playlist Subtitle";

    input.addEventListener(
        "input",
        refreshSubtitleSelects
    );

    subtitleContainer.appendChild(input);

};


/* ==========================================
   最初のSubtitle
========================================== */

document
.querySelector(".subtitle-box")
.addEventListener(
    "input",
    refreshSubtitleSelects
);


/* ==========================================
   Video Card追加
========================================== */

addVideoBtn.onclick = ()=>{

    const card =
        document.createElement("div");

    card.className =
        "video-card";

    card.innerHTML = `

<input
type="file"
class="videoFile"
accept="video/*">

<input
type="text"
class="videoTitle"
placeholder="Video Title">

<select
class="playlistSubtitleSelect">
</select>

<div
class="uploadStatus"
style="
margin-top:10px;
color:#666;
font-size:13px;
">

Waiting

</div>

`;

    videoQueue.appendChild(card);

    refreshSubtitleSelects();

};


/* ==========================================
   Upload
========================================== */

uploadBtn.onclick = async ()=>{

    const playlistTitle =
        document
        .getElementById("playlistTitle")
        .value
        .trim();

    if(!playlistTitle){

        alert("Playlist Title required");

        return;

    }

    const cards =
        document.querySelectorAll(".video-card");

    if(cards.length===0){

        alert("Please add videos.");

        return;

    }

    console.log("Playlist");

    console.log(playlistTitle);

    console.log("Subtitles");

    console.log(getPlaylistSubtitles());

    console.log("Videos");

   const videos = [];

cards.forEach(card=>{

    const file =
        card.querySelector(".videoFile").files[0];

    if(!file) return;

    videos.push({

        file,

        videoTitle:
            card.querySelector(".videoTitle").value.trim(),

        playlistSubtitle:
            card.querySelector(".playlistSubtitleSelect").value

    });

});

await startUpload({

    playlistTitle,

    subtitles:getPlaylistSubtitles(),

    videos,

    teamId,

    currentUser:,

    onProgress:(done,total,title)=>{

        console.log(
            `${done}/${total}`,
            title
        );

    },

    onFinish:(result)=>{

        alert(
            `Upload Complete\n\n${result.uploaded} uploaded`
        );

    },

    onError:(err)=>{

        console.error(err);

        alert(err.message);

    }
});

};
