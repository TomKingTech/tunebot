/*
**  TUNEBOT
**  The chatbot for music trivia contests on Twitch!
**
**  Author : Thomas King
**  Date : October 4th, 2020
*/

/*
**
**  (1) - Read message from chat.
**  (2) - Check answer.
**  (3a) - If correct, add to list of correct answers.
**  (3b) - If incorrect, ignore.
**  (3c) - If correct but fourth answer, ignore.
**  (4) - If next song, update tracker.
**  (5) - If next song, update leaderboard.
**  (6) - Purge temporary items and increase song number.
**  (7) - Move to step 1 with new song, repeat.
*/

// Requires the TMI.js module from the Twitch Chat API.
const tmi = require('tmi.js');

// Define configuration options for Tunebot.
const opts = {
  identity: {
    username: "powertomario",
    password: "oauth:c1vlc9vtbjth8avv9x3eioitda922n" //oauth:
  },
  channels: [
    "powertomario"
  ]
};

// Create a client with our configuration options.
const client = new tmi.client(opts);

// Register our event handlers (defined below.)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch.
client.connect();

// Bring in the 'csv-parser' and 'fs' NodeJS modules.
const csv = require('csv-parser');
const fs = require('fs');

// Bring in the 'csv-writer' NodeJS module, and create a CSV writer object.
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Empty out all object references and values.
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

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


/*
**  Initializing variables for future functions.
*/

let songsList = []; // This is to capture all songs in the .csv file.
let correctAnswers = []; // This is for all users who answer correctly.
let currentScores = []; // This is for the scoreboard updates.
let songNumber = 1; // First song in a new Tunebot contest.


/*
**  Track the users who answered correctly with the songsguessed.csv file.
*/

function trackCorrectAnswers(songNum, usersAnswered) {
  // Capture who answered this song correctly.
  const records = [
    {songnumber: songNum, guessedby1: usersAnswered[0], guessedby2: usersAnswered[1], guessedby3: usersAnswered[2]}
   ];

   console.log(records + "\n"); // Log who got this song correct.

  // Enter a new record into the songsguessed.csv file (new line written).
  csvWriterGuessedBy.writeRecords(records)
    .then( () => {
      console.log("Correct answers for Song # " + songNum + " have been logged successfully!\n") // Log that the .writeRecords() method succeeded.
    });

  console.log(records + "\n"); // Log that the records object still contains data to use.

  // Overwrite the scoreboard.csv file with updated standings.
  fs.createReadStream('scoreboard.csv')
  .pipe(csv())
  .on('data', (data) => {
    console.log("\nNew data from scoreboard: " + data); // Log that data from scoreboard.csv was accepted.
    currentScores.push(data);
  })
  .on('end', () => {

    // Determine if any of the scoring individuals matched.
    let matchCounter1 = 0; // Did the first correct match an existing entry?
    let matchCounter2 = 0; // Did the second correct match an existing entry?
    let matchCounter3 = 0; // Did the third correct match an existing entry?

    // If we have an active scoreboard...
    if (!isEmpty(currentScores)) {
      console.log("There is an active scoreboard!");
      for (i = 0 ; i <= currentScores.length ; i++) {
        // If there was one correct answer...
        if (currentScores[i].Username === records.guessedby1) {
          console.log(records.guessedby1 + " just scored 2 points!"); // Log that the first guesser scored 2 points.
          let currentScore = parseInt(currentScores[i].score); // Change the string of 'Score' and turn it into a number.
          currentScore = currentScore + 2;
          currentScores[i].score = currentScore.toString();
          console.log(records.guessedby1 + " has a total of " + currentScores[i].score + " points!"); // Log the new score for this guesser.
          matchCounter1++;
        }
        // If there was a second correct answer...
        if (currentScores[i].Username === records.guessedby2) {
          let currentScore = parseInt(currentScores[i].score); // Change the string of 'Score' and turn it into a number.
          currentScore = currentScore + 1;
          currentScores[i].score = currentScore.toString();
          console.log(records.guessedby2 + " has scored " + currentScores[i].score + " points!");
          matchCounter2++;
        }
        // If there was a third correct answer...
        if (currentScores[i].Username === records.guessedby3) {
          let currentScore = parseInt(currentScores[i].score); // Change the string of 'Score' and turn it into a number.
          currentScore = currentScore + 1;
          currentScores[i].score = currentScore.toString();
          console.log(records.guessedby3 + " has scored " + currentScores[i].score + " points!");
          matchCounter3++;
        }

        // If the leaderboard is active, but we have new scorers...
        if (matchCounter1 === 0) {
          let newPosition = currentScores.length;
          currentScores[newPosition].Username = records.guessedby1;
          currentScores[newPosition].score = "2";
          console.log(records.guessedby1 + " has scored " + currentScores[newPosition].score + " points and has joined the leaderboard!");
        }
        if (matchCounter2 === 0) {
          let newPosition = currentScores.length;
          currentScores[currentScores.length].Username = records.guessedby2;
          currentScores[currentScores.length].score = "1";
          console.log(records.guessedby2 + " has scored " + currentScores[newPosition].score + " points and has joined the leaderboard!");
        }
        if (matchCounter3 === 0) {
          let newPosition = currentScores.length;
          currentScores[currentScores.length].Username = records.guessedby3;
          currentScores[currentScores.length].score = "1";
          console.log(records.guessedby3 + " has scored " + currentScores[newPosition].score + " points and has joined the leaderboard!");
        }
      }
    }
    // If nobody has scored yet...
    else if (isEmpty(currentScores)) {
      console.log("There is an empty scoreboard!");
      console.log(records.guessedby1);
      if (records.guessedby1) {
        currentScores[0].Username = records.guessedby1;
        currentScores[0].score = "2";
        console.log(records.guessedby1 + " has scored " + currentScores[0].score + " points!");
      }
      else if (records.guessedby2) {
        currentScores[1].Username = records.guessedby2;
        currentScores[1].score = "1";
        console.log(records.guessedby2 + " has scored " + currentScores[1].score + " points!");
      }
      else if (records.guessedby3) {
        currentScores[2].Username = records.guessedby3;
        currentScores[2].score = "1";
        console.log(records.guessedby3 + " has scored " + currentScores[2].score + " points!");
      }
    }

    // Overwrite the scoreboard.csv file.
    writeNewScoreboard(currentScores);
  });
  
  records.length = 0;
  return;
};

// Take all the newPointsScored and overwrite the existing scoreboard.csv
function writeNewScoreboard (newPointsScored) {
  
  const fileName = 'scoreboard.csv';

  fs.writeFile(fileName, extractAsCSV(newPointsScored), err => {
    if (err) {
      console.log("Hey, the scoredboard did not get updated. What gives?");
    }
    else {
      console.log ("The scoreboard was updated!");
    }
  });
  // Take in scoreboard.csv
  // Pass data into an array object
  // Look for any username matches
  // Add their current score and their new points
  // Overwrite the entry in the array that matches their username
  // Do the previous steps with all other guesses until we are ready to write to scoreboard.csv
};

// Extract the currentScores as CSV data.
function extractAsCSV(scoreData) {
  const sameHeaders = ["Username,Score"];
  const rows = scoreData.map(user =>
    `${user.username},${user.score}`
  );
  return sameHeaders.concat(rows).join("\n");
};

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
    function regexReplace(stringA) {
      return stringA.toString().replace(/[^0-9a-zA-Z]/gi, '');
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
        if (correctAnswers[0] === usersName) {
          return;
        }
        correctAnswers[1] = usersName;
        console.log(correctAnswers);
        console.log("2nd correct answer.");
      }
      else if(correctAnswers.length === 2) {
        if (correctAnswers[0] === usersName || correctAnswers[1] === usersName) {
          return;
        }
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

/*
**  Every time a message is typed into the Twitch chat, do stuff with it!
**  Here is our meat and potatoes of Tunebot.js!
*/

function onMessageHandler (target, context, msg, self) {
  
  // Remove whitespace from chat message
  const nextMessage = msg.trim().toString();  // Remove whitespace from ends of the message.

  // Log chat message.
  console.log(nextMessage);

  // Log username.
  const userAnswering = context.username.toString();
  console.log(userAnswering);

  if(nextMessage === "Next Song" && userAnswering === "powertomario") { // If next song
  
    // Track who answered correctly, then clear the array.
    trackCorrectAnswers(songNumber, correctAnswers);
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