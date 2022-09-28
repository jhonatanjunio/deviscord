# Deviscord

A Discord bot made from a web developer to web developers! The goal is to challenge your skills about the basics (or even the advanced stuff!)

## Features

- You can define a routine that launches random quizes about web development directly to your Discord server! With a few steps your bot will challenge the members based on the difficulty and subjects you define! You can read more at [https://quizapi.io/docs/1.0/overview](https://quizapi.io/docs/1.0/overview).
- There is a leveling system implemented to as well a ranking system! Show your users the best among them. You can change the "title" based on how fast the users answers the quizes. Use the command `/profile` while your bot is running to flex 😎

## How to use

- You'll need to create a bot at [Discord Developers's user dashboard](https://discord.com/developers/applications)
- You can find proper help creating your bot by clicking [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- You'll need to generate an API KEY at QuizAPI by accessing [this link](https://quizapi.io/clientarea/settings/token)
- Certify that your bot have the right privileged gateway intent [**Server Members Intent**](https://gist.github.com/advaith1/e69bcc1cdd6d0087322734451f15aa2f#what-are-these-privileged-intents-needed-for)
- You have to add the right .env variables regarding the Discord channels. For this project purpose you'll need to add: 
  - `DISCORD_TOKEN` → your Discord Token
  - `DISCORD_GUILD_ID` → your channel id
  - `DISCORD_CHANNEL_QUIZ_ID` → Channel ID where the Quiz happen
  - `QUIZ_API_TOKEN` → your QuizAPI token
<br><br>
- Feel free to customize the following ENV variables:
  - `QUIZ_DEFAULT_TIMEZONE` → Timezone set for your schedule records
  - `QUIZ_DEFAULT_SCHEDULE` → Cron formatted date for your quiz to run. e.g: "0 8 * * Monday-Friday"
  - `QUIZ_DEFAULT_RANKING_SCHEDULE` → Cron formatted date for your ranking to run. "0 11 * * Friday"
  - `QUIZ_DEFAULT_QUESTIONS_QTY` → Amount of quizes your users can reply a day. e.g: 3
  - `QUIZ_DEFAULT_CATEGORY` → The subject of the quizes users can reply. e.g: "Code". Refer to: [https://quizapi.io/docs/1.0/category](https://quizapi.io/docs/1.0/category)
  
## TODOs
  - There is nothing done regarding the translation. Bot responses are all in Brazilian Portuguese.
  - Code documentation is poor.
  - Tests are not implemented too.
  - Visual interface for a better admin experience.

That's all!
Now you just have to run your server loccally or deploy it to somewhere you want, and you're ready to go.
Enjoy! <br/><br/>

##### Made with 💜 by [Jhonatan](https://github.com/jhonatanjunio)