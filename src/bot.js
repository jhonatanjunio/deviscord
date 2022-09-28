require("dotenv").config();
const { Client, Intents, Collection } = require('discord.js');
const quiz = require("./extras/quiz/quiz");

async function main() {

    global.__basedir = __dirname;

    const client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES
        ],
        partials: [
            'MESSAGE',
            'GUILD_MEMBER',
            'USER',
            'CHANNEL',
            'REACTION'
        ],
    });
    
    ['commands', 'aliases'].forEach(f => client[f] = new Collection());
    ['commands', 'events'].forEach(f => require(`./handlers/${f}`)(client));
    
    client.login(process.env.DISCORD_TOKEN)

    client.on("ready", () => {
        quiz.makeQuiz(client, __dirname);
    });
}

main().catch((error) => {
    console.log(error);
});