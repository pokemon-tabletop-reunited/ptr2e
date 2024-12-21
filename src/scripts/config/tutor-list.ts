import json from "./tutor-list.json" assert {type: "json"};
export const TutorListData = json as {
  slug: string;
  type: "trait" | "ability" | "universal";
  moves: string[];
}[];