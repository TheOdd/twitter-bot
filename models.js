var mongoose = require('mongoose');

const RepliedToId = mongoose.model('RepliedToId', {
  tweetId: {
    type: String,
    required: true
  }
})

module.exports = {
  RepliedToId
}
