const discord = require('discord.js');
const { getRanking } = require('../../helpers/quizhelper');

module.exports = {
    name: 'ranking',
    type: 'CHAT_INPUT',
    run: async (client) => {

        const getBest = await getRanking(5, 'isoWeek');
        let ranking = [];
        let position = 1;
        for (const best in getBest) {

            let rankName = "";

            if (position === 1) {
                rankName = `:first_place: ${position}`;
            } else if (position === 2) {
                rankName = `:second_place: ${position}`;
            } else if (position === 3) {
                rankName = `:third_place: ${position}`;
            } else {
                rankName = `${position}`;
            }

            let rank = {
                "name": `${rankName} - <@${getBest[best].id}>`,
                "value": `**[nível]** ${getBest[best].level}\n**[xp]** ${getBest[best].current_points}\n**[sequência máxima de acertos]** ${getBest[best].max_streak} ${getBest[best].average_ranking != "none" ? `\n**[título baseado no tempo médio de resposta]**\n${getBest[best].average_ranking}` : ''}`
            }

            ranking.push(rank);

            position++;

        }

        const rankingChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_QUIZ);
        const embed = new discord.MessageEmbed()
            .setTitle(`:trophy: Ranking Semanal`)
            .setDescription(ranking.map(rank => `${rank.name}\n${rank.value}`).join("\n\n"))
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/983/983763.png")

        await rankingChannel.send({ embeds: [embed] });

    },
};