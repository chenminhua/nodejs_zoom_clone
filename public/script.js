const socket = io("/");

const myVideo = document.createElement("video");
myVideo.muted = true;
const videoGrid = document.getElementById("video-grid");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3030,
});
peer.on("open", (id) => {
  socket.emit("join-room", roomId, id);
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.emit("join-room", roomId);

const connectToNewUser = (userId, stream) => {
  console.log("new user", userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};
