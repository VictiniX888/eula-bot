import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import getRawBody from 'raw-body';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Reference: https://ianmitchell.dev/blog/deploying-a-discord-bot-as-a-vercel-serverless-function

interface Command {
  name: string;
  description: string;
}

export const HI_COMMAND: Command = {
  name: 'eula',
  description: 'Say hello!',
};

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  // Only respond to POST requests
  if (request.method === 'POST') {
    // Verify request
    const signature = request.headers['x-signature-ed25519'] as string;
    const timestamp = request.headers['x-signature-timestamp'] as string;
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
      const commandName: string = message.data.name;
      switch (commandName.toLowerCase()) {
        case HI_COMMAND.name.toLowerCase(): {
          return response.status(200).send({
            type: 4,
            data: {
              content: 'Mark my words... Vengeance will be mine!',
            },
          });
        }

        default: {
          return response.status(400).send({ error: 'Unknown Type' });
        }
      }
    } else {
      return response.status(400).send({ error: 'Unknown Type' });
    }
  }
}
