
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
}

interface Trait {
    slug: string,
    label: string,
    related: string[],
    description: string,
}

// interface Keyword {
//     slug: string,
//     label: string,
//     traits: string[],
//     description: string,
// }

export default Trait;