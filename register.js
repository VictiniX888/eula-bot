const fetch = require('node-fetch');
const { HI_COMMAND } = require('./commands');

(async () => {
  const getResponse = await fetch(
    `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.TOKEN}`,
      },
      method: 'GET',
    }
  );

  if (!getResponse.ok) {
    console.error('Error getting command');
    const text = await getResponse.text();
    console.error(text);
    return;
  }
  const getData = await getResponse.json();
  const commandId = getData.find((command) => command.name === 'rateup').id;

  const deleteResponse = await fetch(
    `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands/${commandId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.TOKEN}`,
      },
      method: 'DELETE',
    }
  );

  if (deleteResponse.ok) {
    console.log('Deleted rateup command');
  } else {
    console.error('Error deleting commands');
    const text = await deleteResponse.text();
    console.error(text);
  }
})();
