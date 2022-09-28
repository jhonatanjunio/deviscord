# discord-bot

A simple Discord Bot

## Features

- Add default role to the newcomers
- Remove "initial" role from newcomers at the moment they choose a role manually at the server.

## How to use

- You'll need to create a bot at [Discord Developers's user dashboard](https://discord.com/developers/applications)
- You can find proper help creating your bot by clicking [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- Certify that your bot have the right privileged gateway intent [**Server Members Intent**](https://gist.github.com/advaith1/e69bcc1cdd6d0087322734451f15aa2f#what-are-these-privileged-intents-needed-for)
- You have to add the right .env variables regarding to the Discord channels. For this project purpose you'll need to add:
  - DISCORD_LOG_CHANNEL_ID → used to register the members role updates
  - DISCORD_GUILD_ID → your channel id
  - DISCORD_ROLE_DEFAULT → Default role added to the newcomers, name it as you wish
  - DISCORD_CHANNEL_QUITTERS → Channel to register the name of the users that left the server

That's all!
Now you just have to run your server loccally or deploy it to somewhere you want and you're ready to go.
Enjoy! <br/><br/>

##### Made with 💜 by [Jhonatan](https://github.com/jhonatanjunio)