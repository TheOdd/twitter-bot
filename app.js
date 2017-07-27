var express = require('express');
var app = express();
var Twitter = require('twitter');
var mongoose = require('mongoose');
var chalk = require('chalk');
var RepliedToId = require('./models').RepliedToId;

mongoose.connect(process.env.MONGODB_URI)

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const mentionsParams = {

}

const replyToTweet = (statusId, username) => {
  RepliedToId.findOne({
    tweetId: statusId
  })
  .then((doc) => {
    if (!doc) {
      const postParams = {
        status: '@' + username + ' Response v3',
        in_reply_to_status_id: statusId
      }

      client.post('statuses/update', postParams)
      .then(() => {
        console.log(chalk.green('Sent response tweet with message: ' + postParams.status))
        var newReplyId = new RepliedToId({
          tweetId: statusId
        })
        newReplyId.save()
        .then(() => console.log(chalk.green('Saved tweet ID to database.')))
      })
      .catch(err => console.log(chalk.red.bold('ERROR: ' + err)))
    } else {
      console.log(chalk.yellow('Already replied to this tweet!'))
    }
  })
  .catch(err => console.log(chalk.red.bold(err)))
}

const checkMentions = () => {
  client.get('statuses/mentions_timeline', mentionsParams)
  .then((resp) => {
    if (resp.length !== 0) {
      resp.forEach(item => {
        replyToTweet(item.id_str, item.user.screen_name)
      })
    } else {
      console.log(chalk.yellow('No mentions :('))
    }
  })
  .catch(err => console.log(chalk.red.bold('ERROR: ' + err)))
}

setInterval(checkMentions, 30 * 1000);
checkMentions()
