import { BalldontlieAPI } from '@balldontlie/sdk';
// temp comment
const useBallDontLieApi = () => {
  return new BalldontlieAPI({ apiKey: process.env.BALL_DONT_LIE_API_KEY || '' });
};

export { useBallDontLieApi };
