import json from "../../static/lang/en.json";

describe("Load json file", () => {
    test("it should be a valid JSON object", async () => {
        const input = typeof json;

        const output = "object";

        expect(input).toEqual(output);
    });

    test("it should contain valid translation keys", async () => {
        const input = json["TYPES.Actor.humanoid"];
        // EQUAL TO:  const input = json["TYPES.Actor.humanoid"];

        const output = "Humanoid";

        expect(input).toEqual(output);
    });
});
