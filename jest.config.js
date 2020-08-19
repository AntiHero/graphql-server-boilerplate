require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testURL: process.env.JEST_HOST,
  transform: {
    "^.+\\tsx?$": "ts-jest"
  },
  globalSetup: './src/setupTest/setupHelper',
};