const fetch = require('node-fetch');
const Command = require('./command.js');

// Obtained from https://github.com/genshin-kit/genshin-gacha-kit/
const MHY_API = 'https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01';

// Can return undefined
async function fetchBannerData(bannerName) {
  let bannerCode;
  switch (bannerName) {
    case 'character': {
      bannerCode = 301;
      break;
    }
    case 'weapon': {
      bannerCode = 302;
      break;
    }
    default: {
      return;
    }
  }

  const configListUrl = `${MHY_API}/gacha/list.json`;
  const configRes = await fetch(configListUrl);
  const configJson = await configRes.json();
  const configList = configJson.data.list;

  const bannerId = configList.find(
    ({ gacha_type }) => gacha_type === bannerCode
  ).gacha_id;
  const bannerUrl = `${MHY_API}/${bannerId}/en-us.json`;
  const bannerRes = await fetch(bannerUrl);
  const bannerJson = await bannerRes.json();

  return bannerJson;
}

function prettifyBannerData(bannerName, data) {
  const { r4_up_items, r5_up_items } = data;

  const r4Prettified = r4_up_items.map(({ item_name }) => item_name).join(', ');
  const r5Prettified = r5_up_items.map(({ item_name }) => item_name).join(', ');

  return `**Rate-ups for current ${bannerName} banner**
5* Rate-Up: ${r5Prettified}
4* Rate-Up: ${r4Prettified}`;
}

const options = [
  {
    type: 3,
    name: 'banner',
    description: 'The banner to specify',
    choices: [
      { name: 'character', value: 'character' },
      { name: 'weapon', value: 'weapon' },
    ],
  },
];

async function getResponseObj(data) {
  if (data.options === undefined) {
    // No specific banner requested, so return all rate-up banners
    const bannerNames = ['character', 'weapon'];
    const bannerDatas = await Promise.all(
      bannerNames.map(async (bannerName) => await fetchBannerData(bannerName))
    );

    if (bannerDatas.some((data) => data === undefined)) {
      // Some banners do not exist
      return {
        type: 4,
        data: {
          content: 'Some banners could not be found!',
        },
      };
    }

    const prettyData = bannerDatas
      .map((data, i) => prettifyBannerData(bannerNames[i], data))
      .join('\n\n');

    return {
      type: 4,
      data: {
        content: prettyData,
      },
    };
  } else {
    // Specific banner requested
    const bannerName = data.options.find(({ name }) => name === 'banner').value;
    const bannerData = await fetchBannerData(bannerName);
    if (bannerData === undefined) {
      return {
        type: 4,
        data: {
          content: 'Banner does not exist!',
        },
      };
    }

    const prettyData = prettifyBannerData(bannerName, bannerData);

    return {
      type: 4,
      data: {
        content: prettyData,
      },
    };
  }
}

const RATEUP_COMMAND = new Command(
  'rateup',
  'Shows the rate-up items on the specified banner',
  options,
  getResponseObj
);

module.exports = RATEUP_COMMAND;
