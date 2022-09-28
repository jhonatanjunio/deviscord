const moment = require('moment-timezone');
const fs = require('fs').promises;
const translator = require('./translator');
const cron = require('node-cron');
const { pointsByDifficulty, getQuizQuestions } = require('../../helpers/quizhelper');
const question = require('./question');
const ranking = require('./ranking');
require("dotenv").config();

async function makeQuiz(client, dirName) {
    const base_path = dirName
    console.log("🧠 Quiz loaded successfully");
    const quizScheduledTime = process.env.QUIZ_DEFAULT_SCHEDULE;
    const rankingScheduledTime = process.env.QUIZ_DEFAULT_SCHEDULE;
    const scheduleTimezone = process.env.QUIZ_DEFAULT_TIMEZONE;
    const quizQty = process.env.QUIZ_DEFAULT_QUESTIONS_QTY;
    const quizSubject = process.env.QUIZ_DEFAULT_CATEGORY;

    cron.schedule(quizScheduledTime, async () => {

        let txtChannel = client.channels.cache.get(process.env.DISCORD_CHANNEL_QUIZ);
        await txtChannel.send({ content: `⏰ São 8 da manhã! Hora do Quiz! Preparados? BORA!` });
        let quiz = await getQuizQuestions(quizQty, quizSubject);
        let quizes = fs.readFile(`${base_path}/extras/quiz/db/quizes.json`, 'utf8');
        quizes = JSON.parse(await quizes);

        for (const qz in quiz) {

            let getRepeatedQuestion = quizes.filter((question) => question.id === quiz[qz].id);
            while (getRepeatedQuestion.length > 0) {
                console.log("Pergunta repetida, buscando outra pergunta");
                const newQuiz = await getQuizQuestions(1, "Code");

                if (newQuiz && newQuiz[0]) {
                    quiz[qz] = newQuiz[0];
                    console.log("ID da nova pergunta:", quiz[qz].id);
                }

                getRepeatedQuestion = quizes.filter((question) => question.id === quiz[qz].id)
            }

            let alternatives = Object.values(quiz[qz].answers).filter(function (el) { return el != null });
            while (alternatives.length > 5) {

                //Discord limitation for the action buttons is 5 buttons per embed message. When the question
                // have more than 5 possible answers, we get a new quiz.
                console.log("Mais de 5 alternativas, buscando outra pergunta");
                const newQuiz = await getQuizQuestions(1, "Code");

                if (newQuiz && newQuiz[0]){
                    quiz[qz] = newQuiz[0];
                    console.log("ID da nova pergunta:", quiz[qz].id);
                }

                alternatives = Object.values(quiz[qz].answers).filter(function (el) { return el != null })
            }

            let correct_answers = [];
            for (const correct_answer in quiz[qz].correct_answers) {
                if (quiz[qz].correct_answers[correct_answer] == "true") {
                    const correctObj = {
                        alternative: "",
                        answer: ""
                    };

                    const answers = quiz[qz].answers;
                    const answer = correct_answer.split("_correct")[0];
                    correctObj.alternative = answer.split("answer_")[1];
                    correctObj.answer = answers[answer];

                    correct_answers.push(correctObj)
                }
            }

            const translated_question = await translator(quiz[qz].question);
            const question = `**${translated_question}**\nPergunta em inglês: "${quiz[qz].question}"`;

            let newQuiz = {
                "id": quiz[qz].id,
                "question": question,
                "multiple_correct_answers": quiz[qz].multiple_correct_answers,
                "alternatives": quiz[qz].answers,
                "correct_answer": correct_answers,
                "category": quiz[qz].category,
                "tags": quiz[qz].tags,
                "difficulty": quiz[qz].difficulty,
                "points": pointsByDifficulty(quiz[qz].difficulty),
                "asked_at": moment().tz(scheduleTimezone).format("YYYY-MM-DD HH:mm:ss"),
                "is_valid": true
            }

            quizes.push(newQuiz);
            await fs.writeFile(`${base_path}/extras/quiz/db/quizes.json`, JSON.stringify(quizes));
        }

        const activeQuestions = quizes.filter(question => question.is_valid === true);
        let questionNumber = 1;
        for (const activeQuestion in activeQuestions) {
            await question.run(
                client,
                questionNumber,
                activeQuestions[activeQuestion]['id'],
                activeQuestions[activeQuestion]['question'],
                activeQuestions[activeQuestion]['alternatives'],
                activeQuestions[activeQuestion]['correct_answer'],
                activeQuestions[activeQuestion]['difficulty'],
                activeQuestions[activeQuestion]['category'],
                activeQuestions[activeQuestion]['tags'],
                activeQuestions[activeQuestion]['points'],
            );
            questionNumber++;
        }

    }, {
        scheduled: true,
        timezone: scheduleTimezone
    });

    cron.schedule(rankingScheduledTime, async() => {
        await ranking.run(client);
    }, {
        scheduled: true,
        timezone: scheduleTimezone
    });
}

module.exports = { makeQuiz }