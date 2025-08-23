# NBA Everything API

A powerful API of NBA data, designed to drive the functionality of the NBA everything web app: 
- Repository: https://github.com/derekrdrill/nba-everything
- URL: https://nba-everything.vercel.app/

<br>

## Data

### Ball Don't Lie API

Data for this API is sourced from the [Ball Don't Lie API](https://docs.balldontlie.io/#nba-api)

The following endpoint from this api are utilized to power the endpoints of this API:

- https://api.balldontlie.io/v1/teams
- https://api.balldontlie.io/v1/players
- https://api.balldontlie.io/v1/games
- https://api.balldontlie.io/v1/stats

The endpoints are designed to take this data, allocate it to each endpoint to allow for specific, but robust use-cases with NBA data, and some of the endpoints use the data from the Ball Don't Lie endpoints and calculates things that are not available in the Ball Don't Lie tier I have

Things like teams and player stat averages are examples of dynamic things calculated within a the NBA Everything endpoints, something not available in the `ALL-STAR` level Ball Don't Lie Tier

### SportsDataIO

Data is also sourced from the [Sports Data IO NBA API](https://sportsdata.io/developers/api-documentation/nba)

This does not have as much historic data as the Ball Don't Lie API does, but it does provide data that the Ball Don't Lie API does not.

Examples:

- Team logos: https://api.sportsdata.io/v3/nba/scores/json/AllTeams
- Stadium Information: https://api.sportsdata.io/v3/nba/scores/json/Stadiums
- Player Headshots: https://api.sportsdata.io/v3/nba/headshots/json/Headshots

### Game Summary

This is a summary of the game that is returned in the `/game/:gameId` endpoint. It determined based on the total box score and outcome data that is dervied there. `langchain` and Open AI models are used to create the summary and it is then stored in a `MongoDB` to prevent the need to hit Open AI twice for the same game, as a cost-saving and performance measure.


<br>

## Stack

- Node.js
- Express JS
- TypeScript
- Mongoose
- [Ball Don't Lie SDK](https://github.com/balldontlie-api/typescript)
- [MemJS](https://github.com/memcachier/memjs)

<br>

## Caching

- Local caching is set up to maintain cache data directly on the server to aid load times
- [Memcachier](https://www.memcachier.com/), [Heroku](https://devcenter.heroku.com/articles/memcachier), and [MemJS](https://github.com/memcachier/memjs) are also utilized together to cache the data of these endpoints
   - As a back-up for when there are server restarts


<br>

## Deployments and URL

This API is deployed on a Heroku server

To access this API use this URL: https://nba-everything-api-5349aa93ce8d.herokuapp.com

<br>

## Endpoints

Listed below are all available endpoints (data contracts will be added to this documentation soon)

### Game

#### Game by Game ID

      /game/:gameId

### Games

#### Games by Team ID

      /games/:teamId

#### Games by Team ID and Season

      /games/:teamId/:season

### Player

#### Player by Player ID

      /player/:playerId

#### Player Season Stats by Player ID and Season

      /player/:playerId/stats/:season

#### Player Career Stats by Player ID

      /player/:playerId/stats/career

### Teams

#### All teams

      /teams

#### All current teams

      /teams/current
