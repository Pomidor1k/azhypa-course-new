const { Telegraf, Markup } = require("telegraf");
const LocalSession = require("telegraf-session-local");
const messages = require("./messages");
const keyboards = require("./keyboards");
const mainDb = require("./firebase");
const functions = require("./functions");
const { CryptoPay, Assets, PaidButtonNames } = require('@foile/crypto-pay-api');

const webAppUrl = "https://azhypa-web.onrender.com";
//6664007271:AAGIYnU3pxOwTXgzuNylrqZRWRWw6dl39Ao
const bot = new Telegraf("6664007271:AAGIYnU3pxOwTXgzuNylrqZRWRWw6dl39Ao");
const localSession = new LocalSession({ database: "session_db.json" });
const cryptoPayToken = '160624:AA5WhTeiwoQSBLtWhVi2cj3PFwqTacZAltN';
const cryptoPay = new CryptoPay(cryptoPayToken);
bot.use(localSession.middleware());

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    console.log(userId);
    const userName = ctx.from.username ? ctx.from.username : "none";
    const currentTime = await functions.getCurrentTime();
    ctx.session.timeOut1 = true
    try {
        await ctx.replyWithVideo({source: './assets/payment_instructions.mp4'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.paymentOffer_message.ru,
            ...keyboards.paymentOffer_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }

    try {
        await mainDb.createUserDocument(userId, userName, currentTime);
      } catch (error) {
        console.error(error);
        setTimeout(async () => {
          await mainDb.createUserDocument(userId, userName, currentTime);
        }, 90000000);
    }
    
    setTimeout(async () => {
        if (ctx.session.timeOut1) {
            await ctx.replyWithPhoto({source: './assets/welcome.jpg'}, {
                protect_content: true,
                parse_mode: 'HTML',
                caption: messages.welcome_message.ru,
                ...keyboards.welcome_keyboard
            })
        }
    }, 900000);
})

bot.action("welcome-payment", async (ctx) => {
    ctx.session.timeOut1 = false
    try {
        await ctx.replyWithVideo({source: './assets/payment_instructions.mp4'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.paymentOffer_message.ru,
            ...keyboards.paymentOffer_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.hears(["Изменить способ оплаты◀️", "Вернуться к оплате◀️"], async (ctx) => {
    try {
        await ctx.replyWithVideo({source: './assets/payment_instructions.mp4'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.paymentOffer_message.ru,
            ...keyboards.paymentOffer_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.hears("Задать вопрос❓", async (ctx) => {
    try {
        await ctx.replyWithHTML(messages.askQuestion_message.ru, keyboards.askQuestion_keyboard)
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})


bot.hears("Оплатить картой💳", async (ctx) => {
    ctx.session.timeOut1 = false
    try {
        await ctx.replyWithPhoto({source: './assets/pay_by_card_pic.jpg'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.payByCardLink_message.ru,
            ...keyboards.payByCardLink_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.hears("Оплатить криптой💎", async (ctx) => {
    ctx.session.timeOut1 = false
    try {
        await ctx.replyWithPhoto({source: './assets/pay_by_crypto_pic.jpg'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.payByCrypto_message.ru,
            ...keyboards.payByCrypto_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.action("cancel_choosing_crypto_currency", async (ctx) => {
    ctx.session.timeOut1 = true
    try {
        await ctx.replyWithVideo({source: './assets/payment_instructions.mp4'}, {
            protect_content: true,
            parse_mode: 'HTML',
            caption: messages.paymentOffer_message.ru,
            ...keyboards.paymentOffer_keyboard
        })
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({soruce: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.command('admin', async (ctx) => {
  if (String(ctx.from.id) === '689818355' || String(ctx.from.id) === '514751965') {
    try {
      let usersInfo = await mainDb.getAdminUsersInfo()
      await ctx.replyWithHTML(`<b>Информация о пользователях</b>\n\n<b>Количество пользователей:</b>   ${usersInfo.usersAmount}\n\n<b>Количество оплат:</b>   ${usersInfo.paymentsAmount}\n\n<b>Ожидают сессию:</b>   ${usersInfo.waitingForSessionAmount}
      `)
    } catch (error) {
      await ctx.replyWithHTML("Ошибка получения данных")
    }
  }
})


bot.action(["crypto_USDT", "crypto_TON", "crypto_BTC", "crypto_ETH"], async (ctx) => {
    const userId = ctx.from.id
    const chosenCurrency = ctx.callbackQuery.data
    const exchangeObjArray = await cryptoPay.getExchangeRates()
    exchangeObjArray.forEach(currencyObj => {
        if (chosenCurrency === 'crypto_USDT') {
          if (currencyObj.source === 'USDT' && currencyObj.target === 'USD') {
            convertedPrice = String((150 / currencyObj.rate).toFixed(5))
          }
        } else if (chosenCurrency === 'crypto_TON') {
          if (currencyObj.source === 'TON' && currencyObj.target === 'USD') {
            convertedPrice = String((150 / currencyObj.rate).toFixed(5))
          }
        } else if (chosenCurrency === 'crypto_BTC') {
          if (currencyObj.source === 'BTC' && currencyObj.target === 'USD') {
            convertedPrice = String((150 / currencyObj.rate).toFixed(5))
          }
        } else if (chosenCurrency === 'crypto_ETH') {
          if (currencyObj.source === 'ETH' && currencyObj.target === 'USD') {
            convertedPrice = String((150 / currencyObj.rate).toFixed(5))
          }
        }
    })
    const asset = {
        'crypto_USDT': Assets.USDT,
        'crypto_TON': Assets.TON,
        'crypto_BTC': Assets.BTC,
        'crypto_ETH': Assets.ETH
    }
    const invoice = await cryptoPay.createInvoice(asset[chosenCurrency], convertedPrice, {
        description: `Подписка PRO`,
        paid_btn_name: PaidButtonNames.OPEN_BOT,
        paid_btn_url: 'https://t.me/proIevel_bot',
        payload: userId,
    });
    
    ctx.session.primaryInvoiceId = invoice.invoice_id
    
    const cryptoPaymentKeyboard = Markup.inlineKeyboard([
        [Markup.button.url('Оплатить', `${invoice.pay_url}`)],
        [Markup.button.callback('Получить доступ🔑', `checkPrimaryCryptoPayment`)]
    ]);
    const currencyShortNameToDisplay = {
        'crypto_USDT': 'USDT',
        'crypto_TON': 'TON',
        'crypto_BTC': 'BTC',
        'crypto_ETH': 'ETH'
    }
    await ctx.replyWithHTML(`Детали заказа:\n\nТовар: <b>Подписка PRO</b>\n\nСтоимость: <b>${convertedPrice} ${currencyShortNameToDisplay[chosenCurrency]}</b>\n\nПосле оплаты нажмите кнопку "Получить доступ🔑"`, cryptoPaymentKeyboard)
})

bot.action("checkPrimaryCryptoPayment", async (ctx) => {
    const userId = ctx.from.id
  
    try {
      const invoiceStatus = await cryptoPay.getInvoices({invoice_ids: String(ctx.session.primaryInvoiceId)});
      const status = invoiceStatus.items[0].status
      ctx.session.timeOut1 = false
      if (status === 'paid' || userId === 689818355 || userId === 514751965) {
        try {
            await mainDb.updateUserParameter(userId, "userPayment", true)
            await mainDb.updateUserParameter(userId, "userPaymentMethod", "crypto")
        } catch (error) {
            console.error();
            setTimeout(async () => {
                await mainDb.updateUserParameter(userId, "userPayment", true)
                await mainDb.updateUserParameter(userId, "userPaymentMethod", "crypto")
            }, 90000000);
        }
        try {
          await ctx.replyWithPhoto(
            { source: "./assets/successPayment.jpg" },
            {
              protect_content: true,
              reply_markup: { remove_keyboard: true },
            }
          );
        } catch (error) {
          console.error(error);
          await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
          })
        }

        setTimeout(async () => {
            try {
                await ctx.replyWithPhoto({source: './assets/lesson1.jpg'}, {
                    protect_content: true,
                    parse_mode: 'HTML',
                    caption: messages.firstLessonVideoIntro_message.ru,
                    ...keyboards.firstLessonVideoIntro_keyboard
                })
            } catch (error) {
                console.error(error);
                await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                    parse_mode: 'HTML',
                    caption: messages.techProblems_message.ru
                })
            }
          }, 2000);

          setTimeout(async () => {
            try {
                await ctx.replyWithPhoto({source: './assets/test1.jpg'}, {
                    protect_content: true,
                    disable_notification: true,
                    parse_mode: 'HTML',
                    caption: messages.firstLessonTestStart_message.ru,
                    ...keyboards.firstLessonTestStart_keyboard
                })
            } catch (error) {
                console.error(error);
                await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                    parse_mode: 'HTML',
                    caption: messages.techProblems_message.ru
                })
            }
        }, 10000);
      }
  
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})

bot.on("web_app_data", async (ctx) => {
    const userId = ctx.from.id;
    const data = ctx.webAppData.data.json();

    if (data.webAppType === "primary-payment") {
        ctx.session.timeOut1 = false
        try {
            await mainDb.updateUserAfterPaymentInfo(
              userId,
              data.userEmail,
              data.userPhone,
              data.userName,
              data.paymentPrice,
              data.productId,
              "link"
            );
          } catch (error) {
            console.error(error);
            setTimeout(async () => {
              await mainDb.updateUserAfterPaymentInfo(
                userId,
                data.userEmail,
                data.userPhone,
                data.userName,
                data.paymentPrice,
                data.productId
              );
            }, 90000000);
          }
        try {
            await ctx.replyWithPhoto(
              { source: "./assets/successPayment.jpg" },
              {
                protect_content: true,
                reply_markup: { remove_keyboard: true },
              }
            );
          } catch (error) {
            console.error(error);
            await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
              parse_mode: 'HTML',
              caption: messages.techProblems_message.ru
            })
          }

          setTimeout(async () => {
            try {
                await ctx.replyWithPhoto({source: './assets/lesson1.jpg'}, {
                    protect_content: true,
                    parse_mode: 'HTML',
                    caption: messages.firstLessonVideoIntro_message.ru,
                    ...keyboards.firstLessonVideoIntro_keyboard
                })

                setTimeout(async () => {
                    try {
                        await ctx.replyWithPhoto({source: './assets/test1.jpg'}, {
                            protect_content: true,
                            disable_notification: true,
                            parse_mode: 'HTML',
                            caption: messages.firstLessonTestStart_message.ru,
                            ...keyboards.firstLessonTestStart_keyboard
                        })
                    } catch (error) {
                        console.error(error);
                        await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                            parse_mode: 'HTML',
                            caption: messages.techProblems_message.ru
                        })
                    }
                }, 10000);
            } catch (error) {
                console.error(error);
                await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                    parse_mode: 'HTML',
                    caption: messages.techProblems_message.ru
                })
            }
          }, 2000);
    } else if (data.webAppType === "test-one-passed" || data.webAppType === "test-one-skipped") {
        if (data.webAppType === "test-one-passed") {
            try {
                await mainDb.updateUserTests(
                  userId,
                  "userFirstTestPassed",
                  true,
                  "userFirstTestSkipped",
                  false,
                  "userFirstTestAttempts",
                  data.testAttempts
                );
              } catch (error) {
                console.error(error);
                setTimeout(async () => {
                  await mainDb.updateUserTests(
                    userId,
                    "userFirstTestPassed",
                    true,
                    "userFirstTestSkipped",
                    false,
                    "userFirstTestAttempts",
                    data.testAttempts
                  );
                }, 90000000);
              }
        } else if (data.webAppType === "test-one-skipped") {
            try {
                await mainDb.updateUserTests(
                  userId,
                  "userFirstTestPassed",
                  false,
                  "userFirstTestSkipped",
                  true,
                  "userFirstTestAttempts",
                  data.testAttempts
                );
              } catch (error) {
                console.error(error);
                setTimeout(async () => {
                  await mainDb.updateUserTests(
                    userId,
                    "userFirstTestPassed",
                    false,
                    "userFirstTestSkipped",
                    true,
                    "userFirstTestAttempts",
                    data.testAttempts
                  );
                }, 90000000);
              }
        }

        try {
            await ctx.replyWithSticker(
              "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
              {
                protect_content: true,
                reply_markup: { remove_keyboard: true },
              }
            );
          } catch (error) {
            console.error(error);
            await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                parse_mode: 'HTML',
                caption: messages.techProblems_message.ru
            })
        }

        setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/lesson2.jpg" },
              {
                protect_content: true,
                parse_mode: 'HTML',
                caption: messages.secondLessonVideoIntro_message.ru,
                ...keyboards.secondLessonVideoIntro_keyboard,
              }
            );
          }, 2000);


          setTimeout(async () => {
            await ctx.replyWithPhoto(
              { source: "./assets/test2.jpg" },
              {
                disable_notification: true,
                protect_content: true,
                parse_mode: 'HTML',
                caption: messages.secondLessonTestStart_message.ru,
                ...keyboards.secondLessonTestStart_keyboard,
              }
            );
          }, 10000);
    } else if (data.webAppType === "test-two-passed" || data.webAppType === "test-two-skipped") {
        if (data.webAppType === "test-two-passed") {
            try {
                await mainDb.updateUserTests(
                  userId,
                  "userSecondTestPassed",
                  true,
                  "userSecondTestSkipped",
                  false,
                  "userSecondTestAttempts",
                  data.testAttempts
                );
              } catch (error) {
                console.error(error);
                setTimeout(async () => {
                  await mainDb.updateUserTests(
                    userId,
                    "userSecondTestPassed",
                    true,
                    "userSecondTestSkipped",
                    false,
                    "userSecondTestAttempts",
                    data.testAttempts
                  );
                }, 90000000);
              }
        } else if (data.webAppType === "test-two-skipped") {
            try {
                await mainDb.updateUserTests(
                  userId,
                  "userSecondTestPassed",
                  false,
                  "userSecondTestSkipped",
                  true,
                  "userSecondTestAttempts",
                  data.testAttempts
                );
              } catch (error) {
                console.error(error);
                setTimeout(async () => {
                  await mainDb.updateUserTests(
                    userId,
                    "userFirstTestPassed",
                    false,
                    "userFirstTestSkipped",
                    true,
                    "userFirstTestAttempts",
                    data.testAttempts
                  );
                }, 90000000);
              }
        }

        try {
            await ctx.replyWithSticker(
              "CAACAgIAAxkBAAEC-5tlrPIYP3qiZYDaeQrmNfABQJOJCAAC_gADVp29CtoEYTAu-df_NAQ",
              {
                protect_content: true,
                reply_markup: { remove_keyboard: true },
              }
            );
          } catch (error) {
            console.error(error);
            await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                parse_mode: 'HTML',
                caption: messages.techProblems_message.ru
            })
        }

        setTimeout(async () => {
            await ctx.replyWithPhoto({ source: "./assets/lesson3.jpg" }, {
                protect_content: true,
                parse_mode: "HTML",
                caption: messages.thirdLessonVideoIntro_message.ru,
                ...keyboards.thirdLessonVideoIntro_keyboard,
              }
            );

            setTimeout(async () => {
                await ctx.replyWithPhoto(
                  { source: "./assets/bonus.jpg" },
                  {
                    protect_content: true,
                    caption: messages.bonusLessonVideoIntro_message.ru,
                    ...keyboards.bonusLessonVideoIntro_keyboard,
                  }
                )

                setTimeout(async () => {
                    await ctx.replyWithDocument(
                      { source: "./assets/formula2.png" },
                      {
                        protect_content: true,
                        disable_notification: true,
                        ...keyboards.getAccessToChat_keyboard,
                      }
                    );
                  }, 10000);
              }, 30000);
        }, 2000);


    } else if (data.webAppType === "session-register") {
        const currentTime = await functions.getCurrentTime();
        try {
            await mainDb.updateUserPersonalAnswersInfo(
              userId,
              data.userAnswName,
              data.userAnswInst,
              data.userAnswWhoAreYou,
              data.userAnswAim,
              data.userAnswAimRealize,
              data.userAnswWeaknesses,
              data.userAnswClient,
              currentTime
            );
          } catch (error) {
            console.error(error);
            setTimeout(async () => {
              await mainDb.updateUserPersonalAnswersInfo(
                userId,
                data.userAnswName,
                data.userAnswInst,
                data.userAnswWhoAreYou,
                data.userAnswAim,
                data.userAnswAimRealize,
                data.userAnswWeaknesses,
                data.userAnswClient,
                currentTime
              );
            }, 90000000);
          }

        try {
            await ctx.replyWithHTML(messages.proAdvancedFinal_message.ru, {
              reply_markup: { remove_keyboard: true },
            });
          } catch (error) {
            console.error(error);
            await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
                parse_mode: 'HTML',
                caption: messages.techProblems_message.ru
            })
        }
    }
})


bot.action("getFormulaMessage-chatLink", async (ctx) => {
    try {
        await ctx.replyWithHTML("https://t.me/+vRPrDecgJ5k1MmFi", {
          protect_content: true,
        });
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }

    try {
        await ctx.replyWithHTML(messages.signUpForSessionIntro_message.ru, keyboards.signUpForSessionIntro_keyboard);
    } catch (error) {
        console.error(error);
        await ctx.replyWithPhoto({source: './assets/tech_problems_pic.jpg'}, {
            parse_mode: 'HTML',
            caption: messages.techProblems_message.ru
        })
    }
})



const option = { dropPendingUpdates: true };
bot.launch(option);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));