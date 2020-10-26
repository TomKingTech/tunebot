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
    username: "",
    password: "" //oauth:
  },
  channels: [
    ""
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
  const recordsCorrect = [{songnumber: songNum.toString(), guessedby1: usersAnswered[0], guessedby2: usersAnswered[1], guessedby3: usersAnswered[2]}];

  // Enter a new record into the songsguessed.csv file (new line written).
  csvWriterGuessedBy.writeRecords(recordsCorrect)
    .then( () => {
      console.log("Correct answers for Song # " + songNum + " have been logged successfully!\n"); // Log that the .writeRecords() method succeeded.
  });
  recordsCorrect.length = 0;
  return;
}

function updateScoreboard(songNum, usersAnswered) {

  // Capture who answered this song correctly.
  let records = {songnumber: songNum, guessedby1: usersAnswered[0], guessedby2: usersAnswered[1], guessedby3: usersAnswered[2]};

  // Overwrite the scoreboard.csv file with updated standings.
  fs.createReadStream('scoreboard.csv')
  .pipe(csv())
  .on('data', (data) => {
    currentScores.push(data);
    console.log(currentScores);
  })
  .on('end', () => {
    
    console.log("\n");
    console.log("Current Scoreboard")
    for (i = 0; i < currentScores.length; i++) {
      console.log(currentScores[i].Name + " " + currentScores[i].Score);
      console.log(typeof(currentScores[i].Name) + " " + typeof(currentScores[i].Score));
    }
    console.log("\n");

    console.log("People Who Scored For Song #" + songNum);
    console.log(records.songnumber + " " + typeof(records.songnumber));
    console.log(records.guessedby1 + " " + typeof(records.guessedby1));
    console.log(records.guessedby2 + " " + typeof(records.guessedby2));
    console.log(records.guessedby3 + " " + typeof(records.guessedby3));
    console.log("\n");

    // Determine if any of the scoring individuals matched.
    let matchCounter1 = 0; // Did the first correct match an existing entry?
    let matchCounter2 = 0; // Did the second correct match an existing entry?
    let matchCounter3 = 0; // Did the third correct match an existing entry?

    // If we have an active scoreboard...
    if (!isEmpty(currentScores)) {
      console.log("There is an active scoreboard!");
      let currentScore = 0;

      for (i = 0 ; i < currentScores.length ; i++) {
        // If there was one correct answer...
        if (currentScores[i].Name === records.guessedby1) {
          console.log(records.guessedby1 + " just scored 2 points!"); // Log that the first guesser scored 2 points.

          currentScore = parseInt(currentScores[i].Score); // Change the string of 'Score' and turn it into a number.
          currentScore = currentScore + 2;
          currentScores[i].Score = currentScore.toString();

          console.log(currentScores[i].Score);
          console.log(typeof(currentScores[i].Score));

          console.log(records.guessedby1 + " has a total of " + currentScores[i].Score + " points!"); // Log the new score for this guesser.
          
          matchCounter1++;
        }
        // If there was a second correct answer...
        else if (currentScores[i].Name === records.guessedby2) {
          console.log(records.guessedby2 + " just scored 1 point!");

          currentScore = parseInt(currentScores[i].Score); // Change the string of 'Score' and turn it into a number.
          console.log(typeof(currentScore));
          currentScore = currentScore + 1;
          currentScores[i].Score = currentScore.toString();

          console.log(currentScores[i].Score);
          console.log(typeof(currentScores[i].Score));

          console.log(records.guessedby2 + " has a total of " + currentScores[i].Score + " points!");

          matchCounter2++;
        }
        // If there was a third correct answer...
        else if (currentScores[i].Name === records.guessedby3) {
          console.log(records.guessedby3 + " just scored 1 point!");

          currentScore = parseInt(currentScores[i].Score); // Change the string of 'Score' and turn it into a number.
          currentScore = currentScore + 1;
          currentScores[i].Score = currentScore.toString();

          console.log(currentScores[i].Score);
          console.log(typeof(currentScores[i].Score));

          console.log(records.guessedby3 + " has a total of " + currentScores[i].Score + " points!");
          
          matchCounter3++;
        }
      }

      // If the leaderboard is active, but we have new scorers...
      if (matchCounter1 === 0  && typeof(records.guessedby1) !== "undefined") {
        console.log(records.guessedby1 + " has scored 2 points and has joined the leaderboard!");

        let newEntry1 = {Name: records.guessedby1, Score: "2"};

        currentScores.push(newEntry1);
        console.log(currentScores);

        newEntry1 = {};
        
      }
      if (matchCounter2 === 0  && typeof(records.guessedby2) !== "undefined") {
          console.log(records.guessedby3 + " has scored 1 point and has joined the leaderboard!");

          let newEntry2 = {Name: records.guessedby2, Score: "1"};

          currentScores.push(newEntry2);
          console.log(currentScores);

          newEntry2 = {};
      }
      if (matchCounter3 === 0  && typeof(records.guessedby3) !== "undefined") {
          console.log(records.guessedby3 + " has scored 1 point and has joined the leaderboard!");

          let newEntry3 = {Name: records.guessedby3, Score: "1"};

          currentScores.push(newEntry3);
          console.log(currentScores);

          newEntry3 = {};
      }
    }
    // If nobody has scored yet...
    else if (isEmpty(currentScores)) {

      console.log("There is an empty scoreboard!");

      currentScores = [];
      console.log(currentScores);

      if (typeof(records.guessedby1) !== "undefined") {
        currentScores.push({Name: records.guessedby1.toString(), Score: "2"});
        console.log(currentScores[0].Name + " has scored " + currentScores[0].Score + " points!");
      }
      if (typeof(records.guessedby2) !== "undefined") {
        currentScores.push({Name: records.guessedby2.toString(), Score: "1"});
        console.log(currentScores[1].Name + " has scored " + currentScores[1].Score + " point!");
      }
      if (typeof(records.guessedby3) !== "undefined") {
        currentScores.push({Name: records.guessedby3.toString(), Score: "1"});
        console.log(currentScores[2].Name + " has scored " + currentScores[2].Score + " point!");
      }
    }

    console.log("Current (Unsorted) Leaderboard");
    console.log(currentScores);
    console.log("\n");

    console.log("There are " + currentScores.length + " players on the scoreboard!");

    if(typeof(records.guessedby1) !== "undefined") {
      console.log("\nSorting the scores for Song #" + songNum + ".");
      currentScores = sortNewLeaderboard(currentScores); // Order from largest score to smallest score.

      // Overwrite the scoreboard.csv file.
      writeNewScoreboard(currentScores);
      currentScores.length = 0;
    }
  });
  
  records.length = 0;
  return;
};

function sortNewLeaderboard(theScoreboard) {
  console.log(theScoreboard); // What is inside this new scoreboard?

  let sortedScoreboard = []; // Initialize the array to contained the sorted leaderboard.
  let objectToBeSorted = {}; // Initialize the object that will store temporary objects to be sorted.
  let checkLength = theScoreboard.length;  // Using the array length for sorting.
  let x;  // Used to compare scores in higher indices in the sortedScoreboard.
  let start;  // Used to determine the array index to wedge the score into when sorting.
  let deleteCount = 0;  // We are not deleting any entries in the leaderboard.

  for(i = 0; i < theScoreboard.length; i++) {

      objectToBeSorted = theScoreboard[i];

      console.log("What are we sorting?");
      console.log(objectToBeSorted);
      console.log("\n");

      if(checkLength === 0) {
          break;  // Exit the loop if the scoreboard is empty, no point in sorting.
      }

      if(isEmpty(sortedScoreboard)) {  // If the sorted scoreboard is empty.
          console.log("The scoreboard was empty...placing score for " + objectToBeSorted.Name);
          sortedScoreboard.push(objectToBeSorted);
          console.log(sortedScoreboard);
          console.log("\n");
      }
      else if(objectToBeSorted.Score > sortedScoreboard[sortedScoreboard.length - 1].Score) {  // New score is greater than the very last index.
          if(sortedScoreboard.length - 1 === 0) {  // New score is greater than the current index AND that just happens to be index[0] of the array.
              console.log("This is the new highest score, by " + objectToBeSorted.Name);
              sortedScoreboard.unshift(objectToBeSorted);  // Shove item into the first array index, move all others forward.
          }
          else {
              x = sortedScoreboard.length - 2;
              while(x >= 0) {
                  if(objectToBeSorted.Score <= sortedScoreboard[x].Score) {  // If the current score is less than or equal to the next index of the array, splice it in between it and the lower index.
                      console.log("Placing " + objectToBeSorted.Name + " between " + sortedScoreboard[x].Name + " and " + sortedScoreboard[x+1].Name);
                      start = x + 1;
                      sortedScoreboard.splice(start, deleteCount, objectToBeSorted);
                      break;
                  }
                  x--;
              }

              if(x < 0) {  // If we arrive at the curent score being higher than all other scores? Shove item into the first array index, move all others forward.
                  console.log("This is the latest high score, set by " + objectToBeSorted.Name);
                  sortedScoreboard.unshift(objectToBeSorted);
              }
          }
      }
      else if(objectToBeSorted.Score <= sortedScoreboard[sortedScoreboard.length - 1].Score) {  // If the current score is less than or equal to the very last index, push the score to the end of the array.
          sortedScoreboard.push(objectToBeSorted);
      }
  }

  console.log("The newly sorted scoreboard!");
  console.log(sortedScoreboard);

  return sortedScoreboard;
};

// Extract the currentScores as CSV data.
function extractAsCSV(headers, data) {
  const headersCSV = headers;
  const dataCSV = data;
  const rows = dataCSV.map(user =>
    `${user.Name},${user.Score}`
  );
  return headersCSV.concat(rows).join("\n");
};

// Take all the newPointsScored and overwrite the existing scoreboard.csv
function writeNewScoreboard (newPointsScored) {

  const fileName = "scoreboard.csv";
  const sameHeaders = ["Name,Score"];
  const scoreData = newPointsScored;
  console.log("\nWe are placing the below scores into the CSV extractor.");
  console.log(newPointsScored);
  let extractedScoreData = extractAsCSV(sameHeaders, scoreData); // Format the data into comma-separated values with return lines.

  console.log(extractedScoreData); // Show what the extracted score data going into the scoreboard.csv file looks like.

  // Write the extracted score data into the scoreboard.csv file.
  fs.writeFile(fileName, extractedScoreData, err => {
    if (err) {
      console.log("\nHey, the scoreboard did not get updated. What gives?\n");
    }
    else {
      console.log ("\nThe scoreboard was updated!\n");
    }
  });
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
    
    console.log("\nTracking correct answers for Song #" + songNumber + "."); // number
    console.log("Users correct include: " + correctAnswers + "\n"); // object

    // Track who answered correctly, then clear the array.
    trackCorrectAnswers(songNumber, correctAnswers);
    updateScoreboard(songNumber, correctAnswers);
    emptyCorrectAnswers();

    // Increases current song number by 1.
    songNumber++;
    console.log(songNumber);
  }
  else {
    // If username is equal to "Streamlabs", or any chatbot name.

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