import { config } from "dotenv";

config();

function getSecret() {
  if (process.env.CLUB_SECRET) {
    return process.env.CLUB_SECRET;
  } else {
    throw new Error("CLUB_SECRET not set");
  }
}

export { getSecret };
