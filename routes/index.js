import {query} from "../index.js";

export const prepare = [
  query("name"), 
  query("email")
];

export default async function handler(name, email) {
  return JSON.stringify({name, email});
}
