const Command = require('./command.js');
const admin = require('firebase-admin');

const options = [
  {
    type: 3,
    name: 'banner',
    description: 'The banner to roll on',
    required: true,
    choices: [
      { name: 'character', value: 'character' },
      { name: 'weapon', value: 'weapon' },
      { name: 'permanent', value: 'permanent' },
    ],
  },

  {
    type: 4,
    name: 'rolls',
    description: 'The number of times to roll (Max: 10)',
  },
];

function initFirebaseDb() {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  return admin.firestore();
}

async function fetchBannerData(banner, db) {
  const doc = await db.collection('gacha').doc('banners').get();

  if (!doc.exists) {
    return;
  }

  return JSON.parse(doc.data()[banner]);
}

function rollGacha(rolls, bannerData) {
  const r3Prob = parseFloat(bannerData.r3_prob) / 100;
  const r4Prob = parseFloat(bannerData.r4_prob) / 100;
  // const r5Prob = parseFloat(bannerData.r5_prob) / 100;

  const r4UpProb = parseFloat(bannerData.r4_up_prob) / 100;
  const r5UpProb = parseFloat(bannerData.r5_up_prob) / 100;

  const r3List = bannerData.r3_prob_list;
  const r4List = bannerData.r4_prob_list;
  const r4Rateup = bannerData.r4_up_items;
  const r5List = bannerData.r5_prob_list;
  const r5Rateup = bannerData.r5_up_items;

  let rollResults = [];

  for (let i = 0; i < rolls; i++) {
    const randomRank = Math.random();
    if (randomRank < r3Prob) {
      // 3-star
      const randomItem = Math.floor(Math.random() * r3List.length);
      const item = r3List[randomItem];
      rollResults.push({
        rank: 3,
        name: item.item_name,
        type: item.item_type,
      });
    } else if (randomRank < r3Prob + r4Prob) {
      // 4-star
      const isFeatured = Math.random() < r4Rateup;
      if (isFeatured) {
        const randomItem = Math.floor(Math.random() * r4Rateup.length);
        const item = r4Rateup[randomItem];
        rollResults.push({
          rank: 4,
          name: item.item_name,
          type: item.item_type,
        });
      } else {
        const r4RateNormal = r4List.filter(({ is_up }) => !is_up);
        const randomItem = Math.floor(Math.random() * r4RateNormal.length);
        const item = r4RateNormal[randomItem];
        rollResults.push({
          rank: 4,
          name: item.item_name,
          type: item.item_type,
        });
      }
    } else {
      // 5-star
      const isFeatured = Math.random() < r5Rateup;
      if (isFeatured) {
        const randomItem = Math.floor(Math.random() * r5Rateup.length);
        const item = r5Rateup[randomItem];
        rollResults.push({
          rank: 5,
          name: item.item_name,
          type: item.item_type,
        });
      } else {
        const r5RateNormal = r5List.filter(({ is_up }) => !is_up);
        const randomItem = Math.floor(Math.random() * r5RateNormal.length);
        const item = r5RateNormal[randomItem];
        rollResults.push({
          rank: 5,
          name: item.item_name,
          type: item.item_type,
        });
      }
    }
  }

  return rollResults;
}

async function getResponseObj(data) {
  let rolls = data.options.find(({ name }) => name === 'rolls').value;
  if (rolls === undefined) {
    rolls = 10;
  } else if (rolls < 1 || rolls > 10) {
    return {
      type: 4,
      data: {
        content: 'Number of rolls must be between 1 and 10 (inclusive)!',
      },
    };
  }

  const db = initFirebaseDb();
  const bannerName = data.options.find(({ name }) => name === 'banner').value;
  const bannerData = await fetchBannerData(bannerName, db);

  if (bannerData === undefined) {
    return {
      type: 4,
      data: {
        content: 'Banner data could not be found!',
      },
    };
  }

  const rollResults = rollGacha(rolls, bannerData);
  const message = rollResults
    .map(({ rank, name, type }) => `${name} (${rank}* ${type})`)
    .join('\n');

  return {
    type: 4,
    data: {
      content: message,
    },
  };
}

const GACHA_COMMAND = new Command(
  'gacha',
  'Roll on the specified banner',
  options,
  getResponseObj
);

module.exports = GACHA_COMMAND;
