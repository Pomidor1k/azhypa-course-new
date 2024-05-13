const { Markup } = require('telegraf')
const webAppUrl = "https://azhypa-web.onrender.com";

const paymentOffer_keyboard = Markup.keyboard([
    ["Оплатить картой💳"],
    ["Оплатить криптой💎"],
    ["Задать вопрос❓"]
]).resize().oneTime()

const payByCardLink_keyboard = Markup.keyboard([
    [
      Markup.button.webApp(
        "Получить доступ🔑",
        `${webAppUrl}/check_primary_payment`
      ),
    ],
    ["Изменить способ оплаты◀️"],
]).resize()

const payByCrypto_keyboard = Markup.inlineKeyboard([
  [Markup.button.callback('USDT', 'crypto_USDT')],
  [Markup.button.callback('TON', 'crypto_TON')],
  [Markup.button.callback('BTC', 'crypto_BTC')],
  [Markup.button.callback('ETH', 'crypto_ETH')],
  [Markup.button.callback('Назад🔙', 'cancel_choosing_crypto_currency')]
])

const askQuestion_keyboard = Markup.keyboard([
    ["Вернуться к оплате◀️"],
]).resize()

const firstLessonVideoIntro_keyboard = Markup.inlineKeyboard([
  [Markup.button.url('Смотреть видео🖥', `${webAppUrl}/aOUVdbbidP7b`)]
]);
    
const firstLessonTestStart_keyboard = Markup.keyboard([
  [
    Markup.button.webApp(
      "Проверить знания📝",
      `${webAppUrl}/test-one`
    ),
  ],
]).resize().oneTime();

const secondLessonVideoIntro_keyboard = Markup.inlineKeyboard([
  [Markup.button.url('Смотреть видео🖥', `${webAppUrl}/fminiIBUv87bui`)]
]);

const secondLessonTestStart_keyboard = Markup.keyboard([
  [Markup.button.webApp("Проверить знания📝", `${webAppUrl}/test-two`)],
]).resize().oneTime();

const thirdLessonVideoIntro_keyboard = Markup.inlineKeyboard([
  [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/hiYB8ygibrgg`),],
]);

const bonusLessonVideoIntro_keyboard = Markup.inlineKeyboard([
  [Markup.button.url("Смотреть видео🖥", `${webAppUrl}/amfjxu9HInd`)],
]);

const getAccessToChat_keyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Получить доступ в чат!💬', 'getFormulaMessage-chatLink')]
]);

const signUpForSessionIntro_keyboard = Markup.keyboard([
  [Markup.button.webApp("Записаться на сессию✍️", `${webAppUrl}/session-register`),],
]).resize().oneTime();

const welcome_keyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Научиться за 160 минут🚀', 'welcome-payment')]
])


module.exports = {
    paymentOffer_keyboard,
    payByCardLink_keyboard,
    askQuestion_keyboard,
    payByCrypto_keyboard,
    firstLessonTestStart_keyboard,
    firstLessonVideoIntro_keyboard,
    secondLessonVideoIntro_keyboard,
    secondLessonTestStart_keyboard,
    thirdLessonVideoIntro_keyboard,
    bonusLessonVideoIntro_keyboard,
    getAccessToChat_keyboard,
    signUpForSessionIntro_keyboard,
    welcome_keyboard
}