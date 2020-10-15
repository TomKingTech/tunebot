# **TUNEBOT**  /  Music trivia chatbot for Twitch streams!

Take your Twitch channel chat room and turn it into a fully-automated music trivia experience. Archive who got correct answers during which songs/questions, and take your hands off scoring updates with a fully-automated workflow using Node modules!

---

## Dependencies

- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [TMI.js](https://tmijs.com/) (JS package for Twitch)
- Node Modules > [csv-parser](https://www.npmjs.com/package/csv-parser), [csv-writer](https://www.npmjs.com/package/csv-writer), [fs](https://nodejs.org/api/fs.html)

---

## What makes **TUNEBOT** work?

Here is the basic flow from start-to-finish:

1. Turn on your NodeJS/Express server locally (in your Command Line/Terminal) using tunebot.js.

`node public/javascripts/tunebot.js`

2. Once `tunebot.js` is running, it will capture every message sent to the channel designated in your Twitch API key settings towards the beginning of the file. <mark>**Please keep this data private**!</mark>

3. Using the `fs` Node module, we `.createReadStream()` to take in the data on the .csv file.

4. We `.pipe()` the incoming data into the Node module `csv-parser`, which then allows this data to `.push()` into a variable.

5. The inbound message will then be compared with the active entry being read from the .csv; if answer is correct, the player will be scored according to the order in which correct answers are received.

6. Once the bot/broadcaster types a unique message in chat, the next entry in the .csv is made active, and this cycle continues until the entire .csv has been "parsed."

---

## Future Goals for Tunebot.js

- Front-end to interact with the chat bot and click options to change songs, change rounds, type in song titles, perhaps event import files.
- Bring data collected and publish onto a website as a leaderboard or stat tracker. Some data visualization opportunities here!