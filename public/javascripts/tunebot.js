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

// Bring in the 'csv-writer' NodeJs module.
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Create the initial header information to write to scoreboard.csv
const csvWriterScoreboard = createCsvWriter({
  path: 'scoreboard.csv',
  header: [
    {id: 'username', title: 'Username'},
    {id: 'score', title: 'Score'}
  ]
});

// Create the initial header information to write to songsguessed.csv
const csvWriterGuessedBy = createCsvWriter({
  path: 'songsguessed.csv',
  header: [
    {id: 'songnumber', title: 'SongNumber'},
    {id: 'guessedby1', title: 'GuessedBy1'},
    {id: 'guessedby2', title: 'GuessedBy2'},
    {id: 'guessedby3', title: 'GuessedBy3'}
  ]
});

let songsList = []; // This is to capture all songs in the .csv file.
let correctAnswers = []; // This is for all users who answer correctly.

// Empty the correctAnswers array when the next song is queued up.
function emptyCorrectAnswers() {
  correctAnswers.length = 0;
};

// Check to see if the message in Twitch matches the correct answer.
function checkAnswer(currentSong, answer, usersName) {
  // Compare the songsList.
  fs.createReadStream('songs.csv')
  .pipe(csv())
  .on('data', (data) => {
    songsList.push(data)
  })
  .on('end', () => {

    // Takes the current song number, and reduce by 1 to check the correct JSON index value.
    console.log('This check is for Song # ' + currentSong);
    currentSong--;
    currentSong = currentSong.toString();

    // Assigns the current answer to our checking variable. (The title of the game)
    answerToCheck = songsList[`${currentSong}`].Game;
    console.log(answerToCheck);

    // Turns the input into a string and removes all non-alphanumeric characters.
    function regexReplace(string) {
      return string.toString().replace(/[^0-9a-zA-Z]/gi, '');
    };

    // Super Mario Bros. 3 or supermariobros3, both are correct.

    // If they match, return true. Otherwise, return false.
    if(regexReplace(answer).toLowerCase() === regexReplace(answerToCheck).toLowerCase()) {
      
      console.log('Answer = ' + true);

      // Place users with correct answers into the correctAnswers array.
      if(correctAnswers.length === 0) {
        correctAnswers[0] = usersName;
        console.log(correctAnswers);
        console.log("1st correct answer.");
      }
      else if(correctAnswers.length === 1) {
        correctAnswers[1] = usersName;
        console.log(correctAnswers);
        console.log("2nd correct answer.");
      }
      else if(correctAnswers.length === 2) {
        correctAnswers[2] = usersName;
        console.log(correctAnswers);
        console.log("3rd correct answer.");
      }
      else {
        return;
      }
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
  const nextMessage = msg.trim();  // Remove whitespace from ends of the message.

  // Log chat message.
  console.log(nextMessage);

  // Log username.
  const userAnswering = context.username.toString();

  if(nextMessage === "Next Song" && userAnswering === "PowerToMario") {
    // Take the correct answers array, and write the list to the current song entry in a .csv
    emptyCorrectAnswers();

    // Increases current song number by 1.
    songNumber++;
    console.log(songNumber);
  }
  else {
    // Checks for matching correct answer, expected value is 'true' or 'false'.
    checkAnswer(songNumber, nextMessage, userAnswering);
    console.log("###");
    console.log(correctAnswers);
    console.log("###");
  }

};


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}