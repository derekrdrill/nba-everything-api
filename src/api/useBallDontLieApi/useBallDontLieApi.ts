import { BalldontlieAPI } from '@balldontlie/sdk';

const useBallDontLieApi = () => {
  return new BalldontlieAPI({ apiKey: process.env.BALL_DONT_LIE_API_KEY || '' });
};

export { useBallDontLieApi };
