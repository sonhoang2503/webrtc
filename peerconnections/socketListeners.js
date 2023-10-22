// on connection get all availble offers and createOfferEls
socket.on("availableOffers", (offers) => {
  console.log("availableOfferes");
  createOfferEls(offers);
});

//just made a new offer and we're already here call createOfferEls
socket.on("newOfferAwaiting", (offers) => {
  createOfferEls(offers);
});

socket.on("answerResponse", (offers) => {
  addAnswer(offers);
});

socket.on("receiveIceCandidateFromServer", (iceCandidates) => {
  addNewIceCandidate(iceCandidates);
  console.log(iceCandidates);
});

function createOfferEls(offers) {
  //make green answer button for new offer
  const answerEl = document.querySelector("#answer");

  offers.forEach((o) => {
    console.log(o);

    const newOfferEl = document.createElement("div");
    newOfferEl.innerHTML = `<button class="btn btn-success col-1"> Answer ${o.offererUserName}</button>`;
    newOfferEl.addEventListener("click", (e) => anwserOffer(o));
    answerEl.appendChild(newOfferEl);
  });
}
