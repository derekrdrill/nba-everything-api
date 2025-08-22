import { ChatOpenAI } from '@langchain/openai';
import { localCache } from '@cache';

const useGameSummary = async ({ gameData }: { gameData: any }) => {
  const cacheKey = `game_summary_${JSON.stringify(gameData).slice(0, 100)}`;
  const cachedSummary = localCache.get(cacheKey);
  if (cachedSummary) {
    return cachedSummary;
  }

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
  });

  const gameSummaryPrompt = `You are a journalist and data analyst who covers the National Basketball Association passionately.
    You are an expert at taking JSON data from a game and articulating a thorough and intriguing analysis of the game.
    You will be provided JSON data which will consist of "homeTeam" and "visitorTeam" objects, containing 
    box score data, stat leaders and the final score. You will analyze this data, detect any patterns, do any research, 
    and return a summary of how this game went. 
    Include these 3 sections: "Overview" of the game/score/outcome, "Key players" to highlight stat lines/performances, 
    and then wrap it all up with "Insight" of why and how the game went the way it did (this is where your journalism skills should shine).
    Here is this game's JSON data: ${gameData}.
    Please return this data as the following JSON object: { overview: string; keyHighlights: string[]; insight: string }. 
    Please wrap player names and stat values in strong tags in the keyHighlights.
    `;

  const gameSummary = JSON.parse(JSON.stringify(await model.invoke(gameSummaryPrompt))).kwargs
    .content;

  const parsedSummary = JSON.parse(gameSummary);
  localCache.set(cacheKey, parsedSummary, 24 * 60 * 60 * 1000);

  return parsedSummary;
};

export { useGameSummary };
