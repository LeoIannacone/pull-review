var url = require('../../url');

var GITHUB_ICON_URL =
  'https://imsky.github.io/pull-review/pull-review-github-icon.png';

module.exports = function(input) {
  input = input || {};
  var users = input.users;
  var channel = input.channel;
  var pullRequestRecord = input.pullRequestRecord;
  var pullRequest = input.pullRequest;

  if (!Array.isArray(users)) {
    throw Error('Missing users');
  } else if (!channel) {
    throw Error('Missing channel');
  } else if (!pullRequestRecord) {
    throw Error('Missing pull request record');
  }

  if (channel === 'hubot:generic') {
    users = users.map(function(user) {
      return '@' + user;
    });
  } else if (channel === 'hubot:slack') {
    users = users.map(function(user) {
      if (user.indexOf('<') !== 0 && user.indexOf('@') !== 0) {
        return '@' + user;
      }
      return user;
    });
  } else {
    throw Error('Unsupported message channel: ' + channel);
  }

  var message =
    users.join(', ') + ': please review ' + pullRequestRecord.html_url;

  if (channel === 'hubot:generic') {
    return message;
  } else if (channel === 'hubot:slack') {
    var repoName = pullRequest.owner + '/' + pullRequest.repo;
    var title = pullRequestRecord.title;
    var body = pullRequestRecord.body || '';
    var authorName = pullRequestRecord.user.login;
    var imagesInBody = false;
    var keyImage;

    var urls = url.extractURLs(body);

    for (var i = 0; i < urls.length; i++) {
      if (urls[i].match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        imagesInBody = true;
        keyImage = urls[i];
        break;
      }
    }

    var bodyToSlackMarkdown = body
      //convert atx headers to bold text
      .replace(/^#{1,6} (.*?)$/gm, '*$1*')
      //convert markdown links with titles to slack links
      .replace(/\[([^\\\[]+?)\]\((http.*?)\)/gm, '<$2|$1>')
      //convert asterisk-led lists to use bullet points
      .replace(/^\* /gm, '• ')
      //strip language identifiers from code blocks
      .replace(/^```[a-z0-9]+$/gm, '```');

    var attachment = {
      title: repoName + ': ' + title,
      title_link: pullRequestRecord.html_url,
      text: imagesInBody ? '' : bodyToSlackMarkdown,
      author_name: authorName,
      author_link: pullRequestRecord.user.html_url,
      fallback: title + ' by ' + authorName + ': ' + pullRequestRecord.html_url,
      mrkdwn_in: ['text', 'pretext', 'fields'],
      color: '#24292e',
      footer: 'GitHub',
      footer_icon: GITHUB_ICON_URL
    };

    if (imagesInBody) {
      attachment.image_url = keyImage;
    }

    return {
      text: message,
      attachments: [attachment]
    };
  }
};
