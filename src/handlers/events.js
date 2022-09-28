const path = require('path');
const fs = require('fs');

module.exports = (client) => {


    const load = dirs => {
        const events = fs.readdirSync(path.resolve(__dirname, `events/${dirs}/`)).filter(f => f.endsWith('js'));

        for (let file of events) {
            const event = require(`../events/${dirs}/${file}`);
            let eventName = file.split('.')[0];
            console.log(`O evento ${eventName} foi carregado com sucesso`);

            client.on(eventName, event.bind(null, client));
        }
    };

    const loadAlt = dirs => {
        var base_path = __basedir
        const events = fs.readdirSync(`${base_path}/events/${dirs}/`).filter(f => f.endsWith('js'));

        for (let file of events) {
            const event = require(`../events/${dirs}/${file}`);
            let eventName = file.split('.')[0];
            console.log(`O evento ${eventName} foi carregado com sucesso`);

            client.on(eventName, event.bind(null, client));
        }
    };

    try {
        fs.readdirSync(path.resolve(__dirname, 'src/events/')).forEach(x => load(x));
    } catch (error) {
        console.log("basedir: " + __basedir);
        var base_path = __basedir
        fs.readdirSync(`${base_path}/events/`).forEach(x => loadAlt(x));
    }

};