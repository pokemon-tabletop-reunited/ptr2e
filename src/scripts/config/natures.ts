const natureToStatArray = {
    cuddly: ["hp", "atk"],
    distracted: ["hp", "def"],
    proud: ["hp", "spa"],
    decisive: ["hp", "spd"],
    patient: ["hp", "spe"],
    desperate: ["atk", "hp"],
    lonely: ["atk", "def"],
    adamant: ["atk", "spa"],
    naughty: ["atk", "spd"],
    brave: ["atk", "spe"],
    stark: ["def", "hp"],
    bold: ["def", "atk"],
    impish: ["def", "spa"],
    lax: ["def", "spd"],
    relaxed: ["def", "spe"],
    curious: ["spa", "hp"],
    modest: ["spa", "atk"],
    mild: ["spa", "def"],
    rash: ["spa", "spd"],
    quiet: ["spa", "spe"],
    dreamy: ["spd", "hp"],
    calm: ["spd", "atk"],
    gentle: ["spd", "def"],
    careful: ["spd", "spa"],
    sassy: ["spd", "spe"],
    skittish: ["spe", "hp"],
    timid: ["spe", "atk"],
    hasty: ["spe", "def"],
    jolly: ["spe", "spa"],
    naive: ["spe", "spd"],
    hardy: ["atk", "atk"],
    docile: ["def", "def"],
    bashful: ["spa", "spa"],
    quirky: ["spd", "spd"],
    serious: ["spe", "spe"],
    composed: ["hp", "hp"],
};

type Nature = keyof typeof natureToStatArray;

const natures = Object.entries(natureToStatArray).reduce((acc, [nature, stats]) => {
    acc[nature] = `${nature.capitalize()} (+${stats[0]} -${stats[1]})`;
    return acc;
}, {} as Record<string, string>)

export default natureToStatArray;
export {
    natures,
    type Nature
}