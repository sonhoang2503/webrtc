const userName = "Rei-" + Math.floor(Math.random() * 1000000);
const password = "x";
document.querySelector("#user-name").innerHTML = userName;

const socket = io.connect("https://192.168.24.47:8181", {
  auth: {
    userName,
    password,
  },
});

const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;

let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};

const fetchUserMedia = async () => {
  return new Promise(async (res, rej) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      localVideoEl.srcObject = stream;
      localStream = stream;

      res();
    } catch (e) {
      console.log(e);
      rej(e);
    }
  });
};

const addAnswer = async (offerObject) => {
  await peerConnection.setRemoteDescription(offerObject.answer);
  console.log(peerConnection.signalingState);
};

const call = async (e) => {
  await fetchUserMedia();

  // setup peer connection with stun servers
  await createPeerConnection();

  // Get SDP ~~ exchange info so both peer can understand the data is transferring
  try {
    console.log("Creating offer...");
    const offer = await peerConnection.createOffer();
    // console.log(offer);

    peerConnection.setLocalDescription(offer);
    didIOffer = true;
    socket.emit("newOffer", offer);
  } catch (err) {
    console.log(err);
  }
};

const anwserOffer = async (offerObj) => {
  await fetchUserMedia();

  // setup peer connection with stun servers
  await createPeerConnection(offerObj);

  const answer = await peerConnection.createAnswer({});
  // client to answer
  peerConnection.setLocalDescription(answer);

  offerObj.answer = answer;
  console.log("----------------------------hey");
  const offerIceCandidates = await socket.emitWithAck("newAnswer", offerObj);
  console.log(offerIceCandidates);
  offerIceCandidates.forEach((c) => {
    peerConnection.addIceCandidate(c);
    console.log("=========ADDDDDED");
  });
};

const createPeerConnection = async (offerObj) => {
  return new Promise(async (resolve, reject) => {
    // Create new peer connection with config object (can contain stun) return ICE candidates
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log(e);
      console.log(peerConnection.signalingState);
    });

    peerConnection.addEventListener("icecandidate", (e) => {
      socket.emit("sendIceCandidateToSignallingServer", {
        iceCandidate: e.candidate,
        iceUserName: userName,
        didIOffer,
      });
      console.log(".....Ice candidate found!!");
      //   console.log(e);
    });

    peerConnection.addEventListener("track", (e) => {
      console.log("Got a track from the other peer");

      console.log(e);
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
      });
    });

    if (offerObj) {
      // trigger with when answer call

      await peerConnection.setRemoteDescription(offerObj.offer);
    }

    resolve();
  });
};

const addNewIceCandidate = (iceCandidate) => {
  peerConnection.addIceCandidate(iceCandidate);
};

document.querySelector("#call").addEventListener("click", (e) => call(e));
