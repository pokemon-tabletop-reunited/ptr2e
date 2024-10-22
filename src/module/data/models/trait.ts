class Trait {
    static isValid(value: unknown): value is Trait {
        if(typeof value === 'string') {
            return true; //!!game.ptr.data.traits.get(value);
        }
        if(value instanceof Trait) {
            return true;
        }
        return false;
    }

    static bgColors = {
      narrative: {
        border: "#79AF7A",
        bg: "#79AF7A",
        hover: "#7bd77b",
      },
      automated: {
        border: "#7fcbc8",
        bg: "#7fcbc8",
        hover: "#9fd1cf",
      },
      default: {
        border: "var(--border-theme-color)",
        bg: "var(--color-theme-4)",
        hover: "var(--color-theme-3)",
      }
    }
}

interface Trait {
    slug: string,
    label: string,
    related: string[],
    description: string,
    virtual?: boolean,
    type?: "narrative" | "automated"
}

// interface Keyword {
//     slug: string,
//     label: string,
//     traits: string[],
//     description: string,
// }

export default Trait;