import mongoose from 'mongoose';

export const GameSummariesSchema = new mongoose.Schema({
  gameId: String,
  gameSummary: {
    insight: String,
    overview: String,
    keyHighlights: [String],
  },
});

export const GameSummaries =
  mongoose.models?.['game-summaries'] || mongoose.model('game-summaries', GameSummariesSchema);
