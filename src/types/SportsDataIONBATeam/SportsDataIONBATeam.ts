type SportsDataIONBATeam = {
  TeamID: number;
  Key: string;
  Active: boolean;
  City: string;
  Name: string;
  LeagueID: number;
  StadiumID: number;
  Conference: string;
  Division: string;
  PrimaryColor: string;
  SecondaryColor: string;
  TertiaryColor: string;
  QuaternaryColor: string;
  WikipediaLogoUrl: string;
  WikipediaWordMarkUrl: string | null;
  GlobalTeamID: number;
  NbaDotComTeamID: number;
  HeadCoach: string;
};

export { SportsDataIONBATeam };
