import {param} from "../index.js";

export const params = [
  param("name"),
  param("email"),
]

export function handler(name, email) {
  return {name, email}
}

console.log("HERE");
