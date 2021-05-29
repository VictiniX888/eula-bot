const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require('discord-interactions');
const getRawBody = require('raw-body');
const { HI_COMMAND, RATEUP_COMMAND } = require('../commands');

// Reference: https://ianmitchell.dev/blog/deploying-a-discord-bot-as-a-vercel-serverless-function

module.exports = async function (request, response) {
  // Only respond to POST requests
  if (request.method === 'POST') {
    // Verify request
    const signature = request.headers['x-signature-ed25519'];
    const timestamp = request.headers['x-signature-timestamp'];
    const rawBody = await getRawBody(request);

    const isValidRequest = verifyKey(
      rawBody,
      signature,
      timestamp,
      process.env.PUBLIC_KEY
    );

    if (!isValidRequest) {
      return response.status(401).send({ error: 'Bad request signature' });
    }

    // Handle request
    const message = request.body;

    if (message.type === InteractionType.PING) {
      response.send({ type: InteractionResponseType.PONG });
    } else if (message.type === InteractionType.APPLICATION_COMMAND) {
      // Cache responses for 24 hours
      response.setHeader('Cache-Control', 'max-age=0, s-maxage=86400');

      const commandName = message.data.name;

      switch (commandName.toLowerCase()) {
        case HI_COMMAND.name: {
          return response.status(200).send(HI_COMMAND.getResponseObj(data));
        }

        case RATEUP_COMMAND.name: {
          return response
            .status(200)
            .send(await RATEUP_COMMAND.getResponseObj(data));
        }

        default: {
          return response.status(400).send({ error: 'Unknown Type' });
        }
      }
    } else {
      return response.status(400).send({ error: 'Unknown Type' });
    }
  }
};
