const Command = require('./command.js');

const HI_COMMAND = new Command('eula', 'Say hello!', [], () => {
  return {
    type: 4,
    data: {
      content: 'Mark my words... Vengeance will be mine!',
    },
  };
});

module.exports = HI_COMMAND;
