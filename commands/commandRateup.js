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
  const configJson = await configList.json();
  const configList = configJson.data.list;

  const bannerId = configList.find(
    ({ gacha_type }) => gacha_type === bannerCode
  ).gacha_id;
  const bannerUrl = `${MHY_API}/${bannerId}/en-us.json`;
  const bannerRes = await fetch(bannerUrl);
  const bannerJson = await bannerRes.json();

  return bannerJson;
}

function prettifyBannerData(data) {
  const { r4_up_items, r5_up_items } = data;

  return `5* Rate-Up: ${r5_up_items
    .map(({ item_name }) => item_name)
    .join(', ')}
  4* Rate-Up: ${r4_up_items.map(({ item_name }) => item_name).join(', ')}`;
}

const options = [
  {
    type: 3,
    name: 'banner',
    description: 'The banner to specify',
    choices: ['character', 'weapon'],
  },
];

async function getResponseObj(data) {
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

  const prettyData = prettifyBannerData(bannerData);

  return {
    type: 4,
    data: {
      content: prettyData,
    },
  };
}

const RATEUP_COMMAND = new Command(
  'rateup',
  'Shows the rate-up items on the specified banner',
  options,
  getResponseObj
);

module.exports = RATEUP_COMMAND;