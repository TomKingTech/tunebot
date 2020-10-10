/*
**  TUNEBOT
**  The chat bot for music (and other) trivia contests!
**
**  Author : Thomas King
**  Date : October 4th, 2020
**
*/

/*
**
**  (*) - Ensure that a round and number is actively selected on the website.
**  (1) - Take in message from chat.
**  (2) - Pass message into 'answerChecker'.
**  (3a) - If correct, add to next entry in array correctAnswers.
**  (3b) - If incorrect, ignore.
**  (4) - If the number changes mid-round, update the points on the leaderboard.
**  (5) - If the round number changes, update the points on the leaderboard.
**
*/

// Requires that the Twitch 
const tmi = require('tmi.js');

/*
// Select the five song selector areas in demo-song-select.
const songSelect1 = document.querySelector(".song-select-1");
const songSelect2 = document.querySelector(".song-select-2");
const songSelect3 = document.querySelector(".song-select-3");
const songSelect4 = document.querySelector(".song-select-4");
const songSelect5 = document.querySelector(".song-select-5");

// Select the content of the option element inside the select element.
const roundSelect = document.querySelector(".round-select");

// Listen for clicks and update the score when done.
songSelect1.addEventListener("click", scoreUpdate(songSelect1));
songSelect2.addEventListener("click", scoreUpdate(songSelect2));
songSelect3.addEventListener("click", scoreUpdate(songSelect3));
songSelect4.addEventListener("click", scoreUpdate(songSelect4));
songSelect5.addEventListener("click", scoreUpdate(songSelect5));

// Listen for the value to change in the .round-select select element.
roundSelect.addEventListener("change", verifyRound);

function verifyRound() {
    console.log(roundSelect.value);
};
*/

// Define configuration options
const opts = {
  identity: {
    username: "powertomario",
    password: "oauth:c1vlc9vtbjth8avv9x3eioitda922n" //oauth:
  },
  channels: [
    "powertomario"
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Bring in the 'csv-parser' and 'fs' NodeJS modules.
const csv = require('csv-parser');
const fs = require('fs');
let results = []; // This declares a JSON array, technically an object-of-objects.

function checkAnswer(currentSong, answer) {
  // Compare the results.
  fs.createReadStream('test.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data)
  })
  .on('end', () => {

    // Takes the current song number, and reduce by 1 to check the correct JSON index value.
    console.log('This check is for Song # ' + currentSong);
    currentSong--;
    currentSong = currentSong.toString();

    // Assigns the current answer to our checking variable. (The title of the game)
    answerToCheck = results[`${currentSong}`].Game;
    console.log(answerToCheck);

    // Turns the input into a string and removes all non-alphanumeric characters.
    function regexReplace(string) {
      return string.toString().replace(/[^0-9a-zA-Z]/gi, '');
    };

    // If they match, return true. Otherwise, return false.
    if(regexReplace(answer).toLowerCase() === regexReplace(answerToCheck).toLowerCase()) {
      console.log('Answer = ' + true);
      return true;
    }
    else {
      console.log('Answer = ' + false);
      return false;
    }
  });
};

// First song in a new Tunebot contest.
let songNumber = 1;

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  
  // Remove whitespace from chat message
  const nextMessage = msg.trim();

  // Log chat message.
  console.log(nextMessage);

  // Log username.
  console.log(context.username);

  if(nextMessage == "Next Song") {
    // Increases current song number by 1.
    songNumber++;
    console.log(songNumber);
  }
  else {
    // Checks for matching correct answer, expected value is 'true' or 'false'.
    console.log(checkAnswer(songNumber, nextMessage));
  }

};


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}