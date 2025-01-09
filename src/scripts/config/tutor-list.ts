import json from "./tutor-list.json" assert {type: "json"};
export const TutorListData = json as TutorListDataType[];
export type TutorListDataType = {
  slug: string;
  type: "trait" | "ability" | "universal";
  moves: string[];
}