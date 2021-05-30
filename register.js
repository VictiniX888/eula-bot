const fetch = require('node-fetch');
const { GACHA_COMMAND } = require('./commands');

(async () => {
  const response = await fetch(
    `https://discord.com/api/v8/applications/${process.env.DISCORD_APPLICATION_ID}/commands`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
      method: 'PUT',
      body: JSON.stringify([GACHA_COMMAND.registerObj]),
    }
  );

  if (response.ok) {
    console.log('Succesfully registered commands');
  } else {
    console.error('Error registering commands');
    const text = await response.text();
    console.error(text);
  }
})();
