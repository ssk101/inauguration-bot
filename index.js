const fetch = require('node-fetch')
const Discord = require('discord.js')
const cheerio = require('cheerio')
const logger = require('winston')
const token = process.env.INAUGURATION_TOKEN
const botId = process.env.INAUGURATION_ID
const botName = process.env.INAUGURATION_NAME

logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
  colorize: true
})
logger.level = 'debug'

const bot = new Discord.Client()
bot.login(token)

bot.on('ready', async (evt) => {
  logger.info('Connected')
  logger.info('Logged in as: ')
  logger.info(bot.username + ' - (' + bot.id + ')')
})

bot.on('message', async (msg) => {
  if(msg.content === `<@!${botId}>`) {
    let html
    try {
      html = await fetch('https://www.timeanddate.com/countdown/generic?iso=20210120T09&p0=900&msg=Inauguration+2021&font=sanserif')
        .then(res => res.text())
        .then(res => res)
    } catch (e) {
      logger.error(e)
      return msg.channel.send('Had some problems getting the countdown, try again later.')
    }

    const $ = cheerio.load(html)
    const labels = ['day', 'hour', 'minute', 'second']
    const digits = []

    $('.csvg-countdown__content .csvg-digit .csvg-digit-number')
      .each(function(i, e) {
        digits.push($(this).text())
      })

    logger.info(digits)

    if(!digits.length) {
      logger.error(digits)
      return msg.channel.send('Had some problems getting the countdown, try again later.')
    }

    const prettyTime = digits.map((d, i) => {
      const label = +d !== 1 ? `${labels[i]}s` : labels[i]
      let parts = [d, label]
      if(i === 3) {
        parts.unshift('and')
      }
      if(i < 2) {
        parts.push(',')
      }
      return parts.join(' ')
    }).join(' ')

    msg.channel.send(`The inauguration is scheduled to begin in **${prettyTime}.**`)
  }
})
