import mongoose from 'mongoose';

export const PlayerHeadshotsSchema = new mongoose.Schema({
  PlayerID: Number,
  Name: String,
  TeamID: Number,
  Team: String,
  Position: String,
  PreferredHostedHeadshotUrl: String,
  PreferredHostedHeadshotUpdated: String,
  HostedHeadshotWithBackgroundUrl: String,
  HostedHeadshotWithBackgroundUpdated: String,
  HostedHeadshotNoBackgroundUrl: String,
  HostedHeadshotNoBackgroundUpdated: String,
});

export const PlayerHeadshots =
  mongoose.models?.['player-headshots'] ||
  mongoose.model('player-headshots', PlayerHeadshotsSchema);
