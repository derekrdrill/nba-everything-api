import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('NBA Everything API is running...');
});

import teams from '@routes/teams';
import games from '@routes/games';
import game from '@routes/game';
import player from '@routes/player';

app.use('/game', game);
app.use('/games', games);
app.use('/player', player);
app.use('/teams', teams);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
