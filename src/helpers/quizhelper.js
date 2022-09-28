const file_get_contents = require("./file_get_contents");
var moment = require('moment-timezone');
const fs = require('fs').promises;
const path = require('path').resolve(__dirname, '..')

function resolveFilePath(file){
    return path + `/${file}`;
}

function pointsByDifficulty(difficulty) {

    let points = 0;

    switch (difficulty) {
        case "Easy":
            points = 10;
            break;
        case "Medium":
            points = 30;
            break;
        case "Hard":
            points = 50;
            break;
    }

    return points;
}

function textByDifficulty(difficulty) {
    let returnText = "";
    switch (difficulty) {
        case "Easy":
            returnText = "😏 Fácil";
            break;
        case "Medium":
            returnText = "😳 Médio";
            break;
        case "Hard":
            returnText = "🥵 Difícil";
            break;
    }

    return returnText;
}

function sumTimeBonus(seconds) {

    let result = {
        "points": 0,
        "rank": "r u kidding?"
    };

    if (seconds > 0 && seconds <= 180) {
        result.points = 20;
        result.rank = "Lightning Nerd";
    } else if (seconds > 180 && seconds <= 600) {
        result.points = 10;
        result.rank = "Regular MF";
    } else if (seconds > 600 && seconds <= 900) {
        result.points = 5;
        result.rank = "Slowmo";
    }

    return result;
}

async function getQuizQuestions(amount, category = "Code") {
    return JSON.parse(await file_get_contents(`https://quizapi.io/api/v1/questions?apiKey=${process.env.QUIZ_API_TOKEN}&limit=${amount}&category=${category}`));
}

async function getUser(id, username) {

    let users = fs.readFile(resolveFilePath("extras/quiz/db/users.json"), 'utf8');
    users = JSON.parse(await users);
    let user = null;

    if (users.filter((user) => user.id == id).length == 0) {

        user = {
            id: id,
            username: username,
            level: 1,
            max_streak: 0,
            current_streak: 0,
            average_ranking: 'none',
            created_at: moment().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss")
        }

        users.push(user);

        await fs.writeFile(resolveFilePath("extras/quiz/db/users.json"), JSON.stringify(users));

    } else {
        user = users.filter((user) => user.id == id)[0];
    }

    return user;

}

async function updateUserXp(user_id, given_answer, points_achieved) {

    let users = fs.readFile(resolveFilePath("extras/quiz/db/users.json"), 'utf8');
    users = JSON.parse(await users);

    if (users.filter((user) => user.id == user_id).length > 0) {

        const user = users.filter((user) => user.id == user_id)[0];

        if (given_answer == "right") {

            var curPoints = user.current_points + points_achieved;
            var curLevel = Math.floor(.25 * Math.sqrt(curPoints));

            var pointsNextLevel = Math.pow((curLevel + 1) * 4, 2);   //Required XP
            var pointsRequired = pointsNextLevel - curPoints

            user.current_points = curPoints;
            user.level = curLevel;
            user.points_to_next_level = pointsRequired;
            user.current_streak++;
            if (user.current_streak > user.max_streak) user.max_streak = user.current_streak;

            let user_quizes = fs.readFile(resolveFilePath("extras/quiz/db/user_quizes.json"), 'utf8');
            user_quizes = JSON.parse(await user_quizes);
            user_quizes = user_quizes.filter((user_quiz) => user_quiz.user_id == user_id);
            let user_rank_counters = {
                'lightning': 0,
                'regular_mf': 0,
                'joker': 0
            }
            const user_attempts = user_quizes.length;

            for (let i = 0; i < user_quizes.length; i++) {
                switch (user_quizes[i].time_achieved){
                    case "Lightning Nerd":
                        user_rank_counters.lightning++
                        break;
                    case "Regular MF":
                        user_rank_counters.regular_mf++
                        break;
                    case "r u kidding?":
                    case "wrong answer":
                        user_rank_counters.joker++
                        break;
                }
            }

            let average_totals = {
                'lightning': ((user_rank_counters.lightning * 100) / user_attempts).toFixed(2),
                'regular_mf': ((user_rank_counters.regular_mf * 100) / user_attempts).toFixed(2),
                'joker': ((user_rank_counters.joker * 100) / user_attempts).toFixed(2)
            }

            const nice_streak_ranks = [
                "Eu sou a Lenda (eu e o Google) - está em uma sequência de 20 acertos",
                "Frio, calculista e cabeça interplanetária - está em uma sequência de 20 acertos",
                "My name is StackOverflow! (porque é lá que eu acho as respostas para o quiz) - está em uma sequência de 20 acertos"
            ];

            const good_streak_ranks = [
                "Cabeça de nós todos - está em uma sequência de 10 acertos",
                "Respeita minha história (ou meu google) - está em uma sequência de 10 acertos",
                "Primeiramente, beija meu sovaco! - está em uma sequência de 10 ou mais acertos"
            ];

            const nice_ranks = [
                "Relâmpago Marquinhos - responde em até 3 minutos quando tá em um dia bom. Katchau!",
                "Nerd intermitente - responde em até 3 minutos e quase sempre acerta, depende do quanto isso interfere no Naruto",
                "O sol que nasce na fazendinha - 8 horas da manhã e tu já tá ligadão no quiz! Você brilha."
            ];

            const regular_ranks = [
                "Se eu quisesse faria mais... mas tô de boa - responde em até 5 minutos quando não tem nada pra fazer",
                "Eu sabia a resposta, mas queria testar o código do quiz - responde em até 5 minutos e a culpa nunca é dele(a)",
                "Colei mas respondi, fi - responde em até 5 minutos porque estava 'tentando lembrar a resposta'"
            ];

            const bad_ranks = [
                "Antes tarde do que.. eita perdi o busão - responde em até 15 minutos pensando que tava na hora certa",
                "Eu sou foda fi - responde em até 15 minutos e acha que fazer o básico é louvável",
                "Tive que usar cada fração dos meus neurônios, só pergunta difícil - responde em até 15 minutos e inventa uma desculpa pica pra se safar"
            ];

            let maxValue = Object.entries(average_totals).sort((x,y)=>y[1]-x[1])[0];
            if (maxValue && maxValue[0]){

                const random = Math.floor(Math.random() * nice_ranks.length);
                let rank_name = "";

                switch (maxValue[0]){
                    case "lightning":
                        rank_name = nice_ranks[random];
                        break;
                    case "regular_mf":
                        rank_name = regular_ranks[random];
                        break;
                    case "joker":
                        rank_name = bad_ranks[random];
                        break;
                    default:
                        rank_name = "Indefinido (você tá respondendo as parada?)"
                        break;
                }

                if (user.current_streak === 10) {
                    user.average_ranking = good_streak_ranks[random];
                } else if (user.current_streak >= 20 ){
                    user.average_ranking = nice_streak_ranks[random];
                } else {
                    user.average_ranking = rank_name;
                }
            }

        } else {
            user.current_streak = 1;
        }

        const foundIndex = users.findIndex(x => x.id == user.id);
        users[foundIndex] = user;

        await fs.writeFile(resolveFilePath("extras/quiz/db/users.json"), JSON.stringify(users));

    }

}

async function storeUserQuiz(user_id, username, quiz_id, given_answer) {

    const user = await getUser(user_id, username);

    let user_quizes = fs.readFile(resolveFilePath("extras/quiz/db/user_quizes.json"), 'utf8');
    user_quizes = JSON.parse(await user_quizes);

    const result = {
        success: false,
        message: "",
        motive: ""
    }

    if (user_quizes.filter((user_quiz) => user_quiz.user_id == user_id && user_quiz.quiz_id == quiz_id).length == 0) {

        //Get quiz
        let getQuiz = fs.readFile(resolveFilePath("extras/quiz/db/quizes.json"), 'utf8');
        getQuiz = JSON.parse(await getQuiz);
        const quiz = getQuiz.filter((qz) => qz.id == quiz_id)[0];

        const asked_at = moment(quiz.asked_at);
        const now = moment().tz("America/Sao_Paulo");
        const velocity = now.diff(asked_at, 'seconds');
        const bonusTimePoints = sumTimeBonus(velocity);
        const points = quiz.points;

        if (velocity > 900) {
            const resultText = given_answer == "right" ? ":white_check_mark: acertado" : ":x: errado";
            result.success = false;
            result.message = `:alarm_clock: Passaram-se 15 minutos desde o envio da pergunta. O desafio é tentar responder mais cedo da próxima vez!\nCaso tivesse respondido em até 15 minutos, você teria **${resultText}**.`
            result.motive = "late";
            return result;
        }

        const newUserQuiz = {
            username,
            user_id,
            quiz_id,
            velocity: `${velocity} seconds`,
            given_answer,
            points_achieved: given_answer == "right" ? points + bonusTimePoints.points : 0,
            time_achieved: given_answer == "right" ? bonusTimePoints.rank : "wrong answer",
            completed_when: now.format("YYYY-MM-DD HH:mm:ss")
        }

        user_quizes.push(newUserQuiz);

        await fs.writeFile(resolveFilePath("extras/quiz/db/user_quizes.json"), JSON.stringify(user_quizes));

        updateUserXp(user.id, given_answer, newUserQuiz.points_achieved);

        result.success = true;

    } else {
        result.message = "Você já respondeu esta pergunta";
        result.motive = "answered";
    }

    return result;

}

async function invalidateQuiz(quiz_id){

    let quizes = fs.readFile(resolveFilePath("extras/quiz/db/quizes.json"), 'utf8');
    quizes = JSON.parse(await quizes);

    if (quizes.filter((quiz) => quiz.id == quiz_id).length > 0) {

        const quiz = quizes.filter((quiz) => quiz.id == quiz_id)[0];

        quiz.is_valid = false;

        const foundIndex = quizes.findIndex(x => x.id == quiz.id);
        quizes[foundIndex] = quiz;

        await fs.writeFile(resolveFilePath("extras/quiz/db/quizes.json"), JSON.stringify(quizes));

    }

}

async function getRanking(positions, period = 'month'){

    let user_quizes = fs.readFile(resolveFilePath("extras/quiz/db/user_quizes.json"), 'utf8');
    user_quizes = JSON.parse(await user_quizes);

    const today = moment().tz("America/Sao_Paulo");
    user_quizes.filter(uq => moment(uq.completed_when).isBetween(moment().startOf(period), today));

    let users = fs.readFile(resolveFilePath("extras/quiz/db/users.json"), 'utf8');
    users = JSON.parse(await users);

    let filtered_users = [];

    for(const arr in users){
        for(const filter in user_quizes){
            if(users[arr].id === user_quizes[filter].user_id){
                const i = filtered_users.findIndex(x => (x.id === users[arr].id));
                if(i <= -1) filtered_users.push(users[arr]);
            }
        }
    }

    filtered_users.sort((a, b) => {
        return b.current_points - a.current_points;
    });

    filtered_users.length = Math.min(users.length, positions)

    return filtered_users;
}

async function sumQuizesAmount(){
    let quizes = fs.readFile(resolveFilePath("extras/quiz/db/quizes.json"), 'utf8');
    quizes = JSON.parse(await quizes);
    return quizes.length;
}

module.exports = { pointsByDifficulty, storeUserQuiz, getQuizQuestions, textByDifficulty, invalidateQuiz, getRanking, getUser }