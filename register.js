const fetch = require('node-fetch');
const { HI_COMMAND } = require('./commands');

(async () => {
  const response = await fetch(
    `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.TOKEN}`,
      },
      method: 'PUT',
      body: JSON.stringify([HI_COMMAND]),
    }
  );

  if (response.ok) {
    console.log('Registered all commands');
  } else {
    console.error('Error registering commands');
    const text = await response.text();
    console.error(text);
  }
})();
