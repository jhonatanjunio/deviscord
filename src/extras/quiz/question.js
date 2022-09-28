const discord = require('discord.js');
const { textByDifficulty, storeUserQuiz, invalidateQuiz } = require('../../helpers/quizhelper');

module.exports = {
    name: 'question',
    type: 'CHAT_INPUT',
    run: async (client, question, questionId, description, answers, correct_answer, difficulty, category, tags, points) => {

        let txtChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_QUIZ);
        let txt_tags = tags && tags.length ? `\n**TAGs**: ${tags.map(tag => tag.name).join(", ")}` : "";
        description = `**Categoria**: ${category}${txt_tags}\n**Pontuação por acerto**: ${points}\n\n${description}\n\n`;

        const row = new discord.MessageActionRow();
        let buttons = [];
        for (answer in answers) {
            if (answers[answer] != null) {
                let alternative = answer.split("_")[1];
                description += `:regional_indicator_${alternative}:` + "`" + answers[answer] +"`\n";
                buttons.push(
                    new discord.MessageButton()
                        .setLabel(`${alternative.toUpperCase()}`)
                        .setCustomId(`q_${question}_a_${alternative}`)
                        .setStyle('PRIMARY')
                )
            }
        }

        row.addComponents(buttons);

        const embed = new discord.MessageEmbed()
            .setTitle(`:hash: Pergunta #${question} | Dificuldade: ${textByDifficulty(difficulty)}`)
            .setDescription(description)

        const message = await txtChannel.send({ embeds: [embed], components: [row], fetchReply: true });
        const collector = message.createMessageComponentCollector({ time: 900000, componentType: 'BUTTON' });

        collector.on('collect', async (button) => {

            const givenAlternative = button.customId.split("_a_")[1]
            const result = {
                msg: `:regional_indicator_f: Vish, <@${button.user.username}>! Você errou! Sua resposta: :regional_indicator_${givenAlternative}:`,
                given_answer: "wrong"
            };

            for (let i = 0; i < correct_answer.length; i++) {
                if (`q_${question}_a_${correct_answer[i].alternative}` == button.customId){
                    result.msg = `:ballot_box_with_check: Parabéns <@${button.user.username}>! Você acertou.`;
                    result.given_answer = "right";
                    break;
                }
            }

            const storedResult = await storeUserQuiz(button.user.id, button.user.username, questionId, result.given_answer);

            if (storedResult.success == true) {
                await button.reply({ content: `${result.msg}`, ephemeral: true });
            } else if (storedResult.success == false && storedResult.motive == "late") {
                await button.reply({ content: storedResult.message, ephemeral: true });
            } else {
                await button.reply({ content: `:thinking: Parece que você já respondeu a esta pergunta!`, ephemeral: true })
            }

        });

        collector.on('end', async (collected, reason) => {
            await message.edit({ components: [] });
            await invalidateQuiz(questionId);
            const alternatives = correct_answer;
            let replymsg = ":alarm_clock: O tempo acabou! A resposta certa era: ";
            let countAlts = 0;
            for (const alternative in alternatives) {
                let formattedAlternative = `:regional_indicator_${alternatives[alternative].alternative}:|||${alternatives[alternative].answer}`;
                let splitedAlternative = formattedAlternative.split("|||");
                replymsg += splitedAlternative[0] + "`" + splitedAlternative[1] + "`";
                if (countAlts > 1 && countAlts < alternatives.length) {
                    replymsg += " OU ";
                }
                countAlts++;
            }
            await message.reply(replymsg);
        });

    },
};