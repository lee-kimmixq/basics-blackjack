// ---------------- GLOBAL VARIABLES ----------------//

var GM_NAME = "name";
var GM_DEAL = "deal";
var GM_PLAY = "play";
var GM_REVEAL = "reveal";
var NEW_ROUND_MSG =
  "<br> <br> Please input the wagers for each player (separated by a space) and click 'Submit' to start a new round!";
var HIT_STAND = "would you like to hit or stand? (hit/stand)";
var NEW_GAME_MSG =
  "<br><br> All players have been disqualified! <br> Please input player names (separated with a space) and click 'Submit' for a new game!";
var STATUS_BUST = "*BUST*";
var STATUS_STAND = "*STAND*";
var STATUS_BJ = "*BLACKJACK*";

var gameMode = GM_NAME;
var currentDeck = [];
var comHand = [];
var showCards = false;
var players = [];
var namesArray = [];
var currentPlayer = -1;
var myOutputValue = "";

// ---------------- HELPER FUNCTIONS ----------------//

// ======== CARDS RELATED ==========//

var createNewDeck = function () {
  var cardDeck = [];
  var suits = ["hearts", "diamonds", "clubs", "spades"];
  var suitIndex = 0;
  while (suitIndex < suits.length) {
    var currentSuit = suits[suitIndex];

    if (currentSuit == "hearts") {
      suitEmoji = "❤️";
    } else if (currentSuit == "diamonds") {
      suitEmoji = "♦️";
    } else if (currentSuit == "clubs") {
      suitEmoji = "♣️";
    } else if (currentSuit == "spades") {
      suitEmoji = "♠️";
    }

    var rankCounter = 1;
    while (rankCounter <= 13) {
      var cardName = rankCounter;

      if (cardName == 1) {
        cardName = "A";
      } else if (cardName == 11) {
        cardName = "J";
      } else if (cardName == 12) {
        cardName = "Q";
      } else if (cardName == 13) {
        cardName = "K";
      }

      if (rankCounter == 11 || rankCounter == 12 || rankCounter == 13) {
        // set J, Q, K to rank 10
        var cardRank = 10;
      } else if (rankCounter == 1) {
        cardRank = 11; // ace is equal to 11 by default
      } else {
        cardRank = rankCounter;
      }

      var card = {
        name: cardName,
        suit: currentSuit,
        rank: cardRank,
        emoji: suitEmoji,
      };
      cardDeck.push(card);
      rankCounter += 1;
    }
    suitIndex += 1;
  }
  return cardDeck;
};

var getRandomIndex = function (max) {
  return Math.floor(Math.random() * max);
};

var shuffleCards = function (cards) {
  var currentIndex = 0;
  while (currentIndex < cards.length) {
    var randomIndex = getRandomIndex(cards.length);
    var randomCard = cards[randomIndex];
    var currentCard = cards[currentIndex];
    cards[currentIndex] = randomCard;
    cards[randomIndex] = currentCard;
    currentIndex += 1;
  }
  return cards;
};

// ======== OUTPUT RELATED ==========//

var printPlayers = function (details) {
  var i = 0;
  var msg = "";
  if (details == "points") {
    msg += "<br><br> 👯‍♀️ Players: <br> ";
  } else if (details == "wagers") {
    msg += "<br><br> 📊 Tally: <br>";
  }
  while (i < players.length) {
    var num = i + 1;
    if (details == "points") {
      msg += `${num}) ${players[i].name} - Points: ${players[i].points} <br>`;
    } else if (details == "wagers") {
      msg += `${num}) ${players[i].name} - Wager: ${players[i].wager} - Points left: ${players[i].points}<br>`;
    }

    i += 1;
  }
  return msg;
};

var printCards = function (array, num) {
  var i = 0;
  var msg = "";
  while (i < array.length) {
    var currentCard = array[i];
    if (num == 0) {
      msg += "🃏";
    } else if (num == 1) {
      if (i == 0) {
        msg += `${currentCard.name}${currentCard.emoji} `;
      } else {
        msg += "🃏";
      }
    } else if (num == 2) {
      msg += `${currentCard.name}${currentCard.emoji} `;
    }
    i += 1;
  }
  return msg;
};

var printHands = function () {
  var i = 0;
  var msg = "<br><br> ";
  while (i < players.length) {
    msg += `${players[i].name}'s hand: ${printCards(players[i].hand, 2)} ${
      players[i].status
    } `;
    msg += "<br>";
    i += 1;
  }
  if (showCards == false) {
    msg += `
 Computer's hand: ${printCards(comHand, 1)}`;
  } else {
    msg += `Computer's hand: ${printCards(comHand, 2)}`;
  }
  msg += " <br><br>";
  return msg;
};

// ======== LOGIC RELATED ==========//

var addPlayers = function (array) {
  var i = 0;
  var playersArray = [];
  while (i < array.length) {
    var currentObj = {
      name: array[i],
      points: 100,
      status: "",
      inRound: true,
      currentTurn: false,
    };
    playersArray.push(currentObj);
    i += 1;
  }
  return playersArray;
};

var storeWagers = function (array) {
  var wagerIndex = 0;
  while (wagerIndex < array.length) {
    if (
      isNaN(array[wagerIndex]) ||
      array[wagerIndex] == 0 ||
      array[wagerIndex] > players[wagerIndex].points
    ) {
      msg = "⚠️ Please enter a valid wager for each player! ⚠️";
      msg += printPlayers("points");
      return msg;
    }
    wagerIndex += 1;
  }
  wagerIndex = 0;
  while (wagerIndex < array.length) {
    players[wagerIndex].wager = Number(array[wagerIndex]);
    players[wagerIndex].points -= players[wagerIndex].wager;
    wagerIndex += 1;
  }
  return true;
};

var createNewGame = function () {
  currentPlayer = -1;
  currentDeck = [];
  comHand = [];
  showCards = false;
  currentDeck = createNewDeck();
  shuffleCards(currentDeck);
  var i = 0;
  while (i < players.length) {
    players[i].hand = currentDeck.splice(0, 2);
    players[i].status = "";
    players[i].inRound = true;
    i += 1;
  }
  comHand = currentDeck.splice(0, 2);
};

var checkPlayerBJ = function () {
  var bjIndex = 0;
  while (bjIndex < players.length) {
    if (getSum(players[bjIndex].hand) == 21) {
      players[bjIndex].status = STATUS_BJ;
      players[bjIndex].inRound = false;
    }
    bjIndex += 1;
  }
};

var getSum = function (array) {
  var sum = 0;
  var i = 0;
  while (i < array.length) {
    var currentRank = array[i].rank;
    sum += currentRank;
    i += 1;
  }
  return sum;
};

var payoutComBJ = function () {
  var ComBJIndex = 0;
  while (ComBJIndex < players.length) {
    if (players[ComBJIndex].status != STATUS_BJ) {
      tallyPoints(ComBJIndex, "loseBJ");
    } else {
      tallyPoints(ComBJIndex, "tie");
    }
    ComBJIndex += 1;
  }
};

var payoutPlayerBJ = function () {
  var PlayerBJIndex = 0;
  while (PlayerBJIndex < players.length) {
    if (players[PlayerBJIndex].status == STATUS_BJ) {
      tallyPoints(PlayerBJIndex, "winBJ");
    }
    PlayerBJIndex += 1;
  }
};

var getNextPlayer = function () {
  var index = 0;
  while (players[index].inRound == false) {
    index += 1;
    if (index >= players.length) {
      break;
    }
  }
  return index;
};

var endPlayersTurn = function () {
  gameMode = GM_REVEAL;
  myOutputValue += printHands();
  myOutputValue += "Click 'Submit' to reveal Computer's hand!";
  myOutputValue += printPlayers("wagers");
};

var changeAces = function (hand) {
  var newSum = getSum(hand);
  var newAces = 0;
  var i = 0;
  while (i < hand.length) {
    var currentCard = hand[i];
    if (currentCard.name == "A") {
      newAces += 1;
    }
    i += 1;
  }
  while (newSum > 21 && newAces > 0) {
    newSum -= 10;
    newAces -= 1;
  }
  return newSum;
};

var playComTurn = function () {
  var msg = `Computer stands.`;
  if (changeAces(comHand) < 17) {
    var i = 0;
    while (changeAces(comHand) < 17) {
      comHand.push(currentDeck.shift());
      i += 1;
    }
    msg = `Computer drew ${i} card(s).`;
  }
  return msg;
};

var payoutEnd = function (sum) {
  var payoutIndex = 0;
  while (payoutIndex < players.length) {
    if (sum > 21) {
      if (players[payoutIndex].status == STATUS_BUST) {
        tallyPoints(payoutIndex, "tie");
      } else if (players[payoutIndex].status == STATUS_STAND) {
        tallyPoints(payoutIndex, "win");
      }
    } else {
      if (players[payoutIndex].status == STATUS_BUST) {
        tallyPoints(payoutIndex, "lose");
      } else if (players[payoutIndex].status == STATUS_STAND) {
        if (players[payoutIndex].sum > sum) {
          tallyPoints(payoutIndex, "win");
        } else if (players[payoutIndex].sum == sum) {
          tallyPoints(payoutIndex, "tie");
        } else {
          tallyPoints(payoutIndex, "lose");
        }
      }
    }
    payoutIndex += 1;
  }
};

var removePlayers = function () {
  var i = 0;
  var msg = "";
  while (i < players.length) {
    if (players[i].points <= 0) {
      var removedPlayer = players.splice(i, 1);
      msg += `<br> ${removedPlayer[0].name} will be disqualified.`;
      i -= 1;
    }
    i += 1;
  }
  return msg;
};

var tallyPoints = function (i, result) {
  var multiplier = 0;
  if (result == "loseBJ") {
    multiplier = -1;
  } else if (result == "tie") {
    multiplier = 1;
  } else if (result == "win") {
    multiplier = 2;
  } else if (result == "winBJ") {
    multiplier = 3;
  }
  players[i].points += Number(players[i].wager) * multiplier;
  players[i].wager = 0;
};

// ---------------- MAIN ----------------//

var main = function (input) {
  if (gameMode == GM_NAME) {
    // ###################### NAME ###########################
    if (input == "") {
      myOutputValue = "⚠️ Please enter at least 1 name before starting! ⚠️";
    } else {
      // create object for each player and store in players array
      var namesArray = input.split(" ");
      players = addPlayers(namesArray);
      myOutputValue = `${players.length} players registered!`;
      myOutputValue += printPlayers("points");
      myOutputValue += NEW_ROUND_MSG;
      gameMode = GM_DEAL;
    }
  } else if (gameMode == GM_DEAL) {
    // ###################### DEAL ###########################

    // ========== wagers ==========
    var wagersArray = input.split(" ");
    if (input == "" || wagersArray.length != players.length) {
      myOutputValue =
        "⚠️ Please input the wagers for each player separated by a space! ⚠️";
      myOutputValue += printPlayers("points");
      return myOutputValue;
    }
    // put wagers into 'wager' property of individual player objects
    myOutputValue = storeWagers(wagersArray);
    if (myOutputValue != true) {
      return myOutputValue;
    }

    // ========== deal cards ==========
    createNewGame();
    myOutputValue = "Cards dealt.";

    // ========== check for PLAYER blackjacks ==========
    checkPlayerBJ();

    // ========== check for COMPUTER blackjacks ==========
    if (getSum(comHand) == 21) {
      showCards = true;
      myOutputValue += printHands();
      myOutputValue += "Computer blackjack!";
      payoutComBJ();
      myOutputValue += NEW_ROUND_MSG;
      myOutputValue += printPlayers("points");
    } else {
      // ========== else payout for player blackjack and... ==========
      payoutPlayerBJ();

      // ========== start hit/stand cycle ==========
      currentPlayer = getNextPlayer();
      if (currentPlayer >= players.length) {
        endPlayersTurn(); // in case all players blackjack
      } else {
        myOutputValue += printHands();
        myOutputValue += `${players[currentPlayer].name}, ${HIT_STAND}`;
        myOutputValue += printPlayers("wagers");
        gameMode = GM_PLAY;
      }
    }
  } else if (gameMode == GM_PLAY) {
    // ###################### PLAY (HIT/STAND) ###########################
    if (input != "hit" && input != "stand") {
      myOutputValue =
        "⚠️ Invalid input! Please input 'hit' or 'stand' only. ⚠️";
    } else {
      if (input == "hit") {
        // ========== hit ==========
        players[currentPlayer].hand.push(currentDeck.shift());
        myOutputValue = `${players[currentPlayer].name} drew a card. `;

        // variable ace value
        players[currentPlayer].sum = changeAces(players[currentPlayer].hand);

        // ========== check for PLAYER bust ==========
        if (players[currentPlayer].sum > 21) {
          players[currentPlayer].status = STATUS_BUST;
          players[currentPlayer].inRound = false;
          // move to next player
          currentPlayer = getNextPlayer();
          if (currentPlayer >= players.length) {
            endPlayersTurn();
            return myOutputValue;
          }
        }
      } else if (input == "stand") {
        // ========== stand ==========
        players[currentPlayer].status = STATUS_STAND;
        players[currentPlayer].inRound = false;
        myOutputValue = `${players[currentPlayer].name} chose to stand. `;

        // variable ace value
        players[currentPlayer].sum = changeAces(players[currentPlayer].hand);

        // move to next player
        currentPlayer = getNextPlayer();
        if (currentPlayer >= players.length) {
          endPlayersTurn();
          return myOutputValue;
        }
      }
    }
    myOutputValue += printHands();
    myOutputValue += `${players[currentPlayer].name}, ${HIT_STAND}`;
    myOutputValue += printPlayers("wagers");
  } else if (gameMode == GM_REVEAL) {
    // ###################### REVEAL ###########################

    // ========== computer's turn ==========
    myOutputValue = playComTurn();
    showCards = true;
    myOutputValue += printHands();

    // ========== results ==========
    var sumCom = changeAces(comHand);
    if (sumCom > 21) {
      myOutputValue += "Computer busted! All surviving players wins!";
    } else {
      myOutputValue += `Computer got a sum of ${sumCom}!`;
    }
    payoutEnd(sumCom);
    myOutputValue += printPlayers("points");

    // ========== check remaining players ==========
    myOutputValue += removePlayers();
    if (players.length < 1) {
      myOutputValue += NEW_GAME_MSG;
      gameMode = GM_NAME;
    } else {
      myOutputValue += NEW_ROUND_MSG;
      gameMode = GM_DEAL;
    }
  }
  return myOutputValue;
};
