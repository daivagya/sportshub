const GAMES = [
  "Badminton",
  "Tennis",
  "Basketball",
  "Football",
  "Cricket",
  "Volleyball",
  "Table Tennis",
  "Squash",
  "Futsal",
  "Pool",
  "Chess",
  "Carrom",
  "Kabaddi",
  "Handball",
  "Throwball",
] as const;
export default GAMES;
export type GameType = (typeof GAMES)[number];
