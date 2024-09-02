// window.addEventListener("DOMContentLoaded", () => {
//   const queryString = window.location.search;
//   const urlParams = new URLSearchParams(queryString);
//   const player1Id = urlParams.get('player1Id');
//   const player2Id = urlParams.get('player2Id');
//   const matchId = urlParams.get('matchId');

//   if (!(player1Id && player2Id && matchId)) {
//     console.error("params not defined for player1");
//     return;
//   }
//   if (player1Id.startsWith('a99') || player1Id.startsWith('b99')) {


//     startBotGame(true);
//     return;

//   }
//   else {
//     alert("yo");
    
//     setupMultiplayerListeners(socket, playerName);
//     loop();
//   }


// })