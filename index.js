const axios = require('axios');
require('dotenv').config();

let gameCustomerId;
let balance;
let gameResultScore;
const telegramId =  process.env.TELEGRAM_ID;
const min = parseInt(process.env.MIN);
const max = parseInt(process.env.MAX);

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function getUserBalance() {
  const formData = new FormData();
  const headers = {'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent', 'Connection': 'keep-alive'};
  formData.append('telegram_id', telegramId);
  try {
    const response = await axios.get("https://sd-api.faexb.com/api/get-user-balance", {
      params: {
        telegram_id: telegramId
      },
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6",
        "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        Referer: "https://tg-bot-support.onrender.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      body: formData
    })
    balance = response.data.amount;
  } catch (error) {
    console.error('Ошибка при получении баланса пользователя:', error);
  }
}

async function startGame() {
  const formData = new FormData();
  formData.append('telegram_id', telegramId);
  formData.append('game_id', '1');
  try {
    const response = await axios.post('https://sd-api.faexb.com/api/start-game', formData, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        'content-type': 'multipart/form-data',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referer': 'https://tg-bot-support.onrender.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });
    if (response.data.resp === 'ok') {
      gameCustomerId = response.data.data.game_customer_id;
    }
    else {
      if (response.data.msg === 'Game is work') {
        console.error('Игра уже запущена. Пытаюсь ее завершить. Таймаут 1 минута');
        gameCustomerId = response.data.info.id;
        return;
      }
      console.error('Ошибка при запуске игры:', response.data);
    }
  } catch (error) {
    console.error('Ошибка при отправке запроса на старт игры:', error);
  }
}

async function confirmGame() {
  const randomNum = getRandomNumber(min, max);
  gameResultScore = randomNum;
  console.log(randomNum);
  const formData = new FormData();
  formData.append('telegram_id', telegramId);
  formData.append('game_customer_id', gameCustomerId);
  formData.append('bals', randomNum);
  try {
    const response = await axios.post('https://sd-api.faexb.com/api/confim-game', formData, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referer': 'https://tg-bot-support.onrender.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });
    if (response.data.resp === 'ok') {
      console.log('Все хорошо, игра подтверждена.');
    } else {
      console.error('Ошибка при подтверждении игры:', response.data);
    }
  } catch (error) {
    console.error('Ошибка при отправке запроса на подтверждение игры:', error);
  }
}


async function main() {

  while (true) {
      console.log(min, max);
      await delay(1000);

      await getUserBalance();
      console.log('Получил баланс')
      console.log('Баланс: ' + balance);
      await delay(2000);

      console.log('Старт игры');
      await startGame();
      console.log('Играю в игру. Таймаут 1 минута');
      await delay(65000);

      await confirmGame();
      console.log('Конец игры');
      console.log('Нафармили: ' + gameResultScore);
      await delay(2000);

      console.log('Done!')
    }
}

main();
