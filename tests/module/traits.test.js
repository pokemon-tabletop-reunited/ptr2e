import traits from "../../static/traits.json";

describe("Traits JSON", () => {
    test("it should be a valid JSON array", () => {
        expect(Array.isArray(traits)).toBe(true);
        expect(traits.length).toBeGreaterThan(0);
    });

    test("should contain the hexcraft trait", () => {
        const hexcraftTrait = traits.find(trait => trait.slug === "hexcraft");
        
        expect(hexcraftTrait).toBeDefined();
        expect(hexcraftTrait.label).toBe("Hexcraft");
        expect(hexcraftTrait.description).toContain("Tutor List");
        expect(hexcraftTrait.description).toContain("[Hexcraft]");
        expect(Array.isArray(hexcraftTrait.related)).toBe(true);
    });

    test("hexcraft trait should follow the tutor list pattern", () => {
        const hexcraftTrait = traits.find(trait => trait.slug === "hexcraft");
        
        // Should have description mentioning tutor list access
        expect(hexcraftTrait.description).toMatch(/gains? access to the \[.*\] tutor list/i);
        
        // Should have the standard structure
        expect(hexcraftTrait).toHaveProperty("slug");
        expect(hexcraftTrait).toHaveProperty("label");
        expect(hexcraftTrait).toHaveProperty("related");
        expect(hexcraftTrait).toHaveProperty("description");
    });
});