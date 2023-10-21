const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

console.log(supportedConstraints);

const changeVideoSize = () => {
  console.log(stream.getTracks());
  stream.getTracks().forEach((track) => {
    const capab = track.getCapabilities();
    console.log(capab);
  });
};
