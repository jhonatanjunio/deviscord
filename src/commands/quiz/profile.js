const discord = require('discord.js');
const { getUser, getRanking} = require("../../helpers/quizhelper");

module.exports = {
    name: 'profile',
    type: 'CHAT_INPUT',
    description: 'Seu perfil no Quiz!',
    async run(client, interaction) {

        const user = await getUser(interaction.user.id, interaction.user.username);

        const getBest = await getRanking(1, 'isoWeek');
        let rankName = "";
        if (getBest[0].id == interaction.user.id){
            rankName = "GOAT - O top 1 da semana (até o momento)"
        } else {
            rankName = user.average_ranking;
        }

        let description = `**Nível:** ${user.level}\n**Sequência máxima de acertos:** ${user.max_streak}\n**Sequência atual de acertos:** ${user.current_streak}\n**Perfil: **${rankName}`;
        description += `\n${user.current_points > 0 ? "**XP atual:** " + user.current_points : ""}\n${user.points_to_next_level > 0 ? "**XP para o próximo nível:** " + user.points_to_next_level : ""}`

        const embed = new discord.MessageEmbed()
            .setTitle('💡 Veja seu desempenho no Quiz!')
            .setDescription(description)
            .setThumbnail("https://i.ibb.co/5RXLP5L/2aff052d20d9617dd83ea7dd115f9a65.png")

        interaction.reply({ embeds: [embed] })

    },
};