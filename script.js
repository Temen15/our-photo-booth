const homeScreen = document.getElementById("homeScreen");
const roomScreen = document.getElementById("roomScreen");
const resultScreen = document.getElementById("resultScreen");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const roomStatus = document.getElementById("roomStatus");
const waitingMessage = document.getElementById("waitingMessage");

const captureBtn = document.getElementById("captureBtn");
const countdown = document.getElementById("countdown");

const photoCanvas = document.getElementById("photoCanvas");
const finalPhoto = document.getElementById("finalPhoto");

const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");

const retakeBtn = document.getElementById("retakeBtn");

const shareRoomBtn = document.getElementById("shareRoomBtn");
const backBtn = document.getElementById("backBtn");
const resultBackBtn = document.getElementById("resultBackBtn");


let localStream = null;
let peer = null;
let connection = null;

let roomId = null;


/* -----------------------------
   SCREEN SWITCHING
----------------------------- */

function showScreen(screen) {

    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("active"));

    screen.classList.add("active");
}


/* -----------------------------
   CAMERA
----------------------------- */

async function startCamera() {

    try {

        localStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                },
                audio: true
            });

        localVideo.srcObject = localStream;

    } catch (error) {

        alert(
            "Camera permission is required ❤️\n\n" +
            "Please allow camera access in Safari settings."
        );

        console.error(error);
    }
}


/* -----------------------------
   CREATE ROOM
----------------------------- */

createRoomBtn.addEventListener("click", async () => {

    showScreen(roomScreen);

    await startCamera();

    roomId =
        "room-" +
        Math.random()
            .toString(36)
            .substring(2, 8);

    peer = new Peer(roomId);

    peer.on("open", id => {

        roomId = id;

        roomStatus.textContent =
            "Waiting for Babyy ❤️";

        const shareURL =
            window.location.origin +
            window.location.pathname +
            "?room=" +
            roomId;

        console.log("Room URL:", shareURL);

    });


    peer.on("call", call => {

        call.answer(localStream);

        call.on("stream", remoteStream => {

            remoteVideo.srcObject =
                remoteStream;

            waitingMessage.style.display =
                "none";

            roomStatus.textContent =
                "Connected ❤️";

        });

    });


    peer.on("connection", conn => {

        connection = conn;

        connection.on("open", () => {

            roomStatus.textContent =
                "Connected ❤️";

        });

        connection.on("data", data => {

            if (data.type === "countdown") {

                runCountdown(false);

            }

            if (data.type === "capture") {

                capturePhoto();

            }

        });

    });

});


/* -----------------------------
   JOIN ROOM
----------------------------- */

joinRoomBtn.addEventListener("click", () => {

    const id = prompt(
        "Paste Babyy's room code ❤️"
    );

    if (!id) return;

    joinRoom(id);

});


async function joinRoom(id) {

    showScreen(roomScreen);

    await startCamera();

    roomId = id;

    peer = new Peer();

    peer.on("open", myId => {

        roomStatus.textContent =
            "Connecting... ❤️";

        const call =
            peer.call(
                roomId,
                localStream
            );

        call.on("stream", remoteStream => {

            remoteVideo.srcObject =
                remoteStream;

            waitingMessage.style.display =
                "none";

            roomStatus.textContent =
                "Connected ❤️";

        });


        connection =
            peer.connect(roomId);

        connection.on("open", () => {

            roomStatus.textContent =
                "Connected ❤️";

        });

    });

}


/* -----------------------------
   SHARE ROOM
----------------------------- */

shareRoomBtn.addEventListener("click", async () => {

    if (!roomId) return;

    const url =
        window.location.origin +
        window.location.pathname +
        "?room=" +
        roomId;

    if (navigator.share) {

        await navigator.share({

            title: "Our Little Photo Booth ❤️",

            text:
                "Come take a photo with me even though we're far apart ❤️",

            url: url

        });

    } else {

        await navigator.clipboard.writeText(url);

        alert(
            "Room link copied! ❤️"
        );

    }

});


/* -----------------------------
   COUNTDOWN
----------------------------- */

captureBtn.addEventListener("click", () => {

    if (!connection ||
        connection.open) {

        if (connection &&
            connection.open) {

            connection.send({
                type: "countdown"
            });

        }

        runCountdown(true);

    } else {

        alert(
            "Wait for Babyy to join first ❤️"
        );

    }

});


async function runCountdown(sendCapture) {

    for (let i = 3; i > 0; i--) {

        countdown.textContent = i;

        await wait(1000);
    }

    countdown.textContent = "❤️";

    await wait(500);

    countdown.textContent = "";

    if (sendCapture &&
        connection &&
        connection.open) {

        connection.send({
            type: "capture"
        });

    }

    capturePhoto();

}


function wait(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


/* -----------------------------
   CAPTURE PHOTO
----------------------------- */

function capturePhoto() {

    const width = 1200;
    const height = 800;

    photoCanvas.width = width;
    photoCanvas.height = height;

    const ctx =
        photoCanvas.getContext("2d");


    /*
       LEFT SIDE = YOU
       RIGHT SIDE = BABYY
    */

    ctx.fillStyle = "#140b18";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    if (localVideo.readyState >= 2) {

        ctx.drawImage(
            localVideo,
            0,
            0,
            width / 2,
            height
        );

    }


    if (remoteVideo.readyState >= 2) {

        ctx.drawImage(
            remoteVideo,
            width / 2,
            0,
            width / 2,
            height
        );

    }


    /* Overlay */

    const gradient =
        ctx.createLinearGradient(
            0,
            height - 150,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,.7)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        height - 150,
        width,
        150
    );


    /* Text */

    ctx.fillStyle = "white";

    ctx.font =
        "bold 38px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        "♡ BABYY × TEMEN ♡",
        width / 2,
        height - 65
    );


    ctx.font =
        "20px Arial";

    ctx.fillText(
        "Miles apart, together always ❤️",
        width / 2,
        height - 30
    );


    const image =
        photoCanvas.toDataURL(
            "image/jpeg",
            0.92
        );

    finalPhoto.src = image;

    showScreen(resultScreen);

}


/* -----------------------------
   SAVE PHOTO
----------------------------- */

saveBtn.addEventListener("click", () => {

    const link =
        document.createElement("a");

    link.download =
        "our-memory.jpg";

    link.href =
        finalPhoto.src;

    link.click();

});


/* -----------------------------
   SHARE PHOTO
----------------------------- */

shareBtn.addEventListener("click", async () => {

    try {

        const response =
            await fetch(finalPhoto.src);

        const blob =
            await response.blob();

        const file =
            new File(
                [blob],
                "our-memory.jpg",
                {
                    type: "image/jpeg"
                }
            );


        if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: [file]
            })
        ) {

            await navigator.share({

                title:
                    "Our Memory ❤️",

                text:
                    "Our little memory together ❤️",

                files: [file]

            });

        } else {

            saveBtn.click();

            alert(
                "Photo saved! You can now share it from your Photos app ❤️"
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "Couldn't share directly. Try saving the photo first ❤️"
        );

    }

});


/* -----------------------------
   RETAKE
----------------------------- */

retakeBtn.addEventListener("click", () => {

    showScreen(roomScreen);

});


/* -----------------------------
   BACK
----------------------------- */

backBtn.addEventListener("click", () => {

    showScreen(homeScreen);

});


resultBackBtn.addEventListener("click", () => {

    showScreen(roomScreen);

});


/* -----------------------------
   AUTO JOIN FROM LINK
----------------------------- */

window.addEventListener("load", () => {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const room =
        params.get("room");

    if (room) {

        joinRoom(room);

    }

});