const fs = require("fs");
const path = require("path");
module.exports = (client) => {
    const slashCommands = [];

    const load = async dirs => {
        const commands = fs.readdirSync(path.resolve(__dirname, `commands/${dirs}/`)).filter(f => f.endsWith('js'));
        for (const file of commands) {
            const command = require(`../commands/${dirs}/${file}`);
            await client.commands.set(command.name, command);
            slashCommands.push(command);

            console.log(`O comando ${command.name} foi carregado com sucesso.`);
        }
    };

    const loadAlt = async dirs => {
        var base_path = __basedir
        const commands = fs.readdirSync(`${base_path}/commands/${dirs}/`).filter(f => f.endsWith('js'));

        for (let file of commands) {
            const command = require(`../commands/${dirs}/${file}`);
            await client.commands.set(command.name, command);
            slashCommands.push(command);

            console.log(`O comando ${command.name} foi carregado com sucesso.`);
        }
    };

    try {
        fs.readdirSync(path.resolve(__dirname, 'src/commands/')).forEach(x => load(x));
    } catch (error) {
        var base_path = __basedir
        fs.readdirSync(`${base_path}/commands/`).forEach(x => loadAlt(x));
    }

    client.on('ready', async () => {
        await client.application.commands.set(slashCommands);
    });

};