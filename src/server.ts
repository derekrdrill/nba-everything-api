import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const urlItems = [
  'nba-everything.netlify.app',
  'nba-everything.netlify-dev.app',
  'nba-everything-git-',
  'nba-everything-',
  'localhost:1217',
];

interface CorsOptions {
  origin: (
    origin?: string | undefined,
    callback?: (err: Error | null, allow?: boolean) => void,
  ) => void;
  methods: string;
  allowedHeaders: string;
  credentials: boolean;
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (callback) {
      if (!origin) return callback(null, true);
      if (urlItems.some((item) => origin.includes(item))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
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
