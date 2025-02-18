# NBA Everything API

A powerful API of NBA data, designed to drive the functionality of the NBA everything web app: 
- Repository: https://github.com/derekrdrill/nba-everything
- URL: _Production URL coming soon_

<br>

## Data

### Ball Don't Lie API

The data for this API is sourced from the https://docs.balldontlie.io/#nba-api

The following endpoint from this api are utilized to power the endpoints of this API:

- https://api.balldontlie.io/v1/teams
- https://api.balldontlie.io/v1/players
- https://api.balldontlie.io/v1/games
- https://api.balldontlie.io/v1/stats

The endpoints are designed to take this data, allocate it to each endpoint to allow for specific, but robust use-cases with NBA data, and some of the endpoints use the data from the Ball Don't Lie endpoints and calculates things that are not available in the Ball Don't Lie tier I have

Things like teams and player stat averages are examples of dynamic things calculated within a the NBA Everything endpoints, something not available in the `ALL-STAR` level Ball Don't Lie Tier

### Future AI plans?

`langchain` may be immplemented to utilize OpenAI models to feed data that is not part of the Ball Don't Lie API

Things such as:

- team colors
- player photos
- highlight video urls

And endless other NBA data could all potentially be pulled into some of the NBA Everything API endpoints with AI

<br>

## Stack

- Node.js
- Express JS
- TypeScript
- [Ball Don't Lie SDK](https://github.com/balldontlie-api/typescript)
- [MemJS](https://github.com/memcachier/memjs)

<br>

## Caching

[Memcachier](https://www.memcachier.com/), [Heroku](https://devcenter.heroku.com/articles/memcachier), and [MemJS](https://github.com/memcachier/memjs) are utilized together to cache the data of these endpoints



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
