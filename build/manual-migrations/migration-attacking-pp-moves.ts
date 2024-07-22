import fs from "fs";
import path from "path";
import url from "url";
import { sluggify } from "../lib/helpers.ts";

const data = [
    {
        "slug": "drill-peck",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "rage-fist",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "astonish",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "metal-cruncher",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "wake-up-slap",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "dizzy-punch",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "tesla-prod",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "crush-grip",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "doom-desire",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "iron-head",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mud-bomb",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "ancient-power",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "tera-blast",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "body-press",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "shadow-crush",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "high-horsepower",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "pyro-ball",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "relic-dance",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "overheat",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "torch-song",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "hidden-power",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "blazing-torque",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "eruption",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "baddy-bad",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "trop-kick",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "ice-spinner",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "steamroller",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "flying-press",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "rolling-kick",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "bullet-seed",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "struggle",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "sand-decker",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "leech-life",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "combat-torque",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "revelation-dance",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "energy-ball",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-force",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "bite",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "circle-throw",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "sludge-bomb",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "order-up",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "brutal-swing",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "missile-kick",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "tempered-steel",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "last-resort",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fishious-rend",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "stone-axe",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "water-pledge",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "water-pulse",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "hyperspace-hole",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hyper-drill",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "magical-torque",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "dual-chop",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "snore",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "psyshield-bash",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "flutter-jump-attack",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "bleakwind-storm",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "ice-breaker",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "pin-missile",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "poison-jab",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "proton-beam",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "v-create",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "hard-press",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "origin-pulse",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "steel-beam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "razor-shell",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "glitzy-glow",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "freeze-shock",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "one-two-punch",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "revenge",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "wildbolt-storm",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "overdrive",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "drain-punch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-devastation",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "shadow-pummel",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "zippy-zap",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dire-claw",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "first-impression",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "boomburst",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "rage",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "wrap",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "swift",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "plasma-fists",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "covet",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "drain-life",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "blast-burn",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "pocket-knife",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "salt-cure",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "smart-strike",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "spirit-fire",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "asteroid-shot",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "foul-play",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "stored-power",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "dracosmack",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "sky-attack",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "glitter-toss",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-shave",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "thunderbolt",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "alluring-voice",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "freezy-frost",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "searing-shot",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "force-palm",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "petal-blizzard",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "hammer-arm",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "magma-storm",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "flare-blitz",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "ember",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "vine-whip",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "psycho-cut",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dig",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "explosion",
        "total": 14,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "mega-drain",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-rush",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "psychic-fangs",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-bolt",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "burning-jealousy",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "night-shade",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "volt-switch",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "beak-blast",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "spin-out",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mighty-cleave",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "sand-sling",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "cheap-shot",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "behemoth-bash",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "scald",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "buzzy-buzz",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "leaf-blade",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "arm-thrust",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "synchronoise",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "draco-jet",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "low-sweep",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "feint-attack",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "terrorize",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "prismatic-laser",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "mystical-fire",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "infestation",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "vise-grip",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "branch-poke",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "psywave",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "liquidation",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "magnitude",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "constrict",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "quantum-leap",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "empathy-pulse",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hyper-voice",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "bonemerang",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "headbutt",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "deathroll",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "icarus-sweep",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "caustic-breath",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "waterfall",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dynamic-punch",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "shadow-break",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "shadow-surge",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "brine",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "flail",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "shadow-strike",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "flame-wheel",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "bitter-blade",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "solar-blade",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "bone-rush",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "midas-touch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "power-up-punch",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "quick-attack",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "aerial-ace",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "sacred-sword",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "grav-apple",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "last-respects",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "electroweb",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "clear-smog",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "flame-charge",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "u-turn",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "moongeist-beam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "core-enforcer",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "belch",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "crystal-rush",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "astral-barrage",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "judgment",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "double-shock",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "snarl",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dragon-ascent",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "submission",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "electro-drift",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-scythe",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "thunderclap",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "extreme-speed",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "brick-break",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "ice-hammer",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "double-slap",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "terrain-pulse",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "bind",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "dazzle-attack",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dive",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "atomic-punch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "breaking-swipe",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "axe-kick",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "heart-stamp",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dragon-breath",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "poltergeist",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "steel-wing",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "shadow-blast",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "cross-poison",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "shadow-end",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "solar-beam",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fire-pledge",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "echoed-voice",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "discharge",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "hex",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bubble",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "wood-hammer",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fling",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "flamethrower",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "secret-power",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "shock-awe",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "water-spout",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "psyblade",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "payback",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "thousand-cuts",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "lumina-crash",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "guillotine",
        "total": -5,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "poison-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "wicked-blow",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "armor-cannon",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "noxious-torque",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "burn-up",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "undercut",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "ancient-roar",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "thousand-waves",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "slaying-blade",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shock-wave",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "karma-beam",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "collision-course",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "sludge",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shell-trap",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "drakon-voice",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "pay-day",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "leaf-storm",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "lands-wrath",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "acid",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "tempest",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "disaster",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "spring-tail",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "karate-chop",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "horn-leech",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "pincer-attack",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "cross-chop",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dark-ray-attack",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "water-shuriken",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "triple-arrows",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "giga-drain",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "pursuit",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "tera-starstorm",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "headlong-rush",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "clanging-scales",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "perplex",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-blitz",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "population-bomb",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "chatter",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "sizzly-slide",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "punishment",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "rapid-spin",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "slam",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "rock-slide",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "confusion",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "psystrike",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "power-whip",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bulldoze",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "psychic",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-corruption",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "lunge",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "comet-punch",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "origin-flare",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "focus-blast",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-wrath",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "razor-wind",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "temper-flare",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "shadow-fire",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "pollen-puff",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "atom-split",
        "total": 15,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "heat-crash",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "smack-down",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "wild-charge",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "draining-kiss",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "luster-purge",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "draco-meteor",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "turnabout-attack",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "magnet-bomb",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "lively-dance-attack",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "instant-crush",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "bullet-punch",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-wave",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dragon-rage",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "floaty-fall",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fissure",
        "total": -4,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "upper-hand",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "roar-of-time",
        "total": 12,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "natural-gift",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fickle-beam",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "feint",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "crabhammer",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "ceaseless-edge",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "icicle-spear",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "psyshock",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "esper-wing",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "disarming-voice",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "multi-attack",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "springtide-storm",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "veevee-volley",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "surging-strikes",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "grass-knot",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "lick",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "close-combat",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "razor-leaf",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hold-back",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "powder-snow",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dream-eater",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bug-buzz",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "raging-fury",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "spirit-away",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "sandsear-storm",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "aqua-tail",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "steam-eruption",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "expanding-force",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "lava-plume",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "grass-pledge",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "sludge-wave",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "wing-attack",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "rock-climb",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dazzling-gleam",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "flash-cannon",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "bitter-malice",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "round",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "sparkly-swirl",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "dragon-hammer",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "spacial-rend",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "tail-slap",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "wave-crash",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "origin-bolt",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "slash",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "mach-punch",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "salt-crash",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "jet-strike",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "wicked-torque",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mystical-power",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "silver-wind",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "shell-side-arm",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "cut",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "fire-punch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "fire-spin",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "rock-tomb",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "whirlpool",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "oceans-wrath",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "crunch",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "make-it-rain",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "aeroblast",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "photon-geyser",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "acid-spray",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "aqua-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "chip-away",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "prism-beam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "nuclear-slash",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "acrobatics",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "outrage",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "psycho-boost",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "stomping-tantrum",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "sky-uppercut",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "thrash",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mud-tail",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "beat-up",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "ice-shard",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "x-scissor",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "aqua-cutter",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "bug-bite",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "glacial-lance",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "return",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "aqua-jet",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "high-jump-kick",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "zing-zap",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "storm-throw",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "signal-beam",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "expunge",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "tachyon-cutter",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "water-gun",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "absorb",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "snowball",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "snap-trap",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "psybolt",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "night-slash",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "volt-tackle",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "gamma-ray",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "spectral-thief",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "ice-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "wring-out",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "nip-attack",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "thunder-cage",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "drill-run",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "barb-barrage",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "shave-attack",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "earthquake",
        "total": 15,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "cold-snap",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "pounce",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "sky-drop",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "scorching-sands",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mist-ball",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-storm",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "hyper-beam",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "ice-punch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "precipice-blades",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "breaking-hold",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "gulp-missile",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "clamp",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dragon-darts",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "dust-devil",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "radioacid",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "gunk-shot",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "pixie-tail",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "possession",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "icy-wind",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "extrasensory",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "bolt-beak",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "trump-card",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "spike-cannon",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "kowtow-cleave",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "jolt-attack",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "fury-cutter",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "nuzzle",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "elixer-field-attack",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "gyro-ball",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "misty-explosion",
        "total": 15,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "heavy-slam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-claw",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "sand-tomb",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "blaster-knuckle",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "giga-impact",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "coral-break",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "throat-chop",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "lovely-bite",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "cosmic-ascent",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "double-kick",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "supercell-slam",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "low-kick",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "darkest-lariat",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mountain-gale",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fusion-flare",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "aurora-beam",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "head-charge",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "dark-pulse",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "fell-stinger",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "strange-steam",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "fake-out",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "kiloton-detonation",
        "total": 13,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "rollout",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-chill",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "diamond-claw-attack",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "spit-up",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "flame-impact",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "apple-acid",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "crashing-bolt",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mud-slap",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "zen-headbutt",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "play-rough",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "weather-ball",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "miracle-will",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bubble-beam",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "icicle-crash",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "peck",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "sparkling-aria",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "genesis-shackles",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "skull-bash",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "dynamax-cannon",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "oblivion-wing",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "horn-drill",
        "total": -5,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "pika-papow",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "shadow-sneak",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "probing-poke",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "spark",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "present",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "hurricane",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "parabolic-charge",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "aura-sphere",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "gust",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "sky-fall",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "night-daze",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "facade",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "electro-ball",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "glaive-rush",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "eternabeam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "eerie-spell",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "vacuum-wave",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "triple-dive",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "accelerock",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "steel-roller",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "fire-blast",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "malignant-chain",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "drum-beating",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hydro-pump",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "twister",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "tackle",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "thunderous-kick",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fury-swipes",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "grassy-glide",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "brave-bird",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "false-swipe",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "megahorn",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "psybeam",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "thunder-shock",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "bounce",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "thunder-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "blaze-kick",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "ice-burn",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "strength",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "ice-ball",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "techno-blast",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "scorched-earth",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "skitter-smack",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "sucker-punch",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "chloroblast",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "grim-fangs",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "phantom-force",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "pound",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "sappy-seed",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "triple-axel",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "anchor-shot",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "sacred-fire",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mana-spark-attack",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "hyperspace-fury",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "golden-glove",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "lightning-knee",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "bone-club",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "glaciate",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "crush-claw",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "magical-leaf",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "thunder-punch",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "behemoth-blade",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "raging-bull",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "venoshock",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "focus-punch",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fly",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "aqua-step",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "thief",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "wind-shear",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "splishy-splash",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "third-degree",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "sliding-tackle",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "twin-beam",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "incinerate",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "gear-grind",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "hydro-cannon",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "grass-water-pledge",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "moonblast",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "jaw-lock",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "frost-slash",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "earthbreaker",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "thunder",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "retaliate",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "spirit-shackle",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bouncy-bubble",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "pluck",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "zap-cannon",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "shield-bash",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "flower-trick",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "ominous-wind",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "struggle-bug",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "rock-wrecker",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "fiery-wrath",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "poison-sting",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dragon-claw",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "air-slash",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "jet-punch",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "scale-shot",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "plasma-pulse",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "future-sight",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "frustration",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hyper-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "flip-turn",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-rave",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fairy-wind",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "self-destruct",
        "total": 13,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "bat-wood",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "relic-song",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "mega-punch",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "double-iron-bash",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "atlas-crash",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "rock-throw",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "fusion-bolt",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bolt-strike",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "double-hit",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "get-lucky",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "shadow-barrage",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "barrage",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "secret-sword",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "spectral-tail",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "sunsteel-strike",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "superpower",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "sudden-strike",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "freezing-glare",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "dragon-tail",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "heat-wave",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "blizzard",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "gemstone-glimmer",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-ball",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "trailblaze",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "fire-fang",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "tear-gas-attack",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "charge-beam",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "seed-bomb",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "poison-tail",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "dragon-pulse",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "seed-flare",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "matcha-gotcha",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "meteor-beam",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-crash",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "smelling-salts",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "petal-dance",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "gigaton-hammer",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "infernal-parade",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "mud-shot",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "twineedle",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "spirit-break",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "aura-wheel",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "muddy-water",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "shadow-shard",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "laser-pulse",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "heartful-embrace",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "scratch",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "achilles-heel",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "car-crash",
        "total": -4,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "fury-attack",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "blue-flare",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "dragon-rush",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mortal-spin",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "flame-burst",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "rock-blast",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "false-surrender",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "pastel-punch",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "double-edge",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "electrostun",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "shadow-bone",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "head-smash",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "stone-edge",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mudslide",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "frost-breath",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "reversal",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "vital-throw",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "battering-ram",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "stomp",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "diamond-storm",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "power-gem",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "fire-lash",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "assurance",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "leaf-tornado",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "air-cutter",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "jagged-fangs",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "rising-voltage",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "psychic-noise",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "metal-claw",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "take-down",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "lash-out",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "ivy-cudgel",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "nuclear-wind",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "inferno",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "seismic-fist",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "hydro-steam",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "depth-charge",
        "total": 6,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "bat-aluminium",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "web-ball",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "wormhole",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "smog",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "iron-tail",
        "total": 3,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "octazooka",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "leafage",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "engulf",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "mirror-shot",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-reprisal",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "jump-kick",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "detonation",
        "total": 13,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "frenzy-plant",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "mind-blown",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "light-of-ruin",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "fiery-dance",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "thousand-arrows",
        "total": 11,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "dark-matter",
        "total": 9,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "ice-beam",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "cinder",
        "total": 0,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "blood-moon",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "chilling-water",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "surf",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "infernal-blade",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "mega-kick",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "metal-whip",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "sonic-boom",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "attack-order",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "needle-arm",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "rock-smash",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "corrode",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "hive-assault",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "rough-swipe-attack",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "triple-kick",
        "total": -2,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "dragon-energy",
        "total": 10,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "fumble",
        "total": 0,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "meteor-mash",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "horn-attack",
        "total": 2,
        "grade": "D",
        "ignored": false
    },
    {
        "slug": "freeze-dry",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "outburst",
        "total": 16,
        "grade": "S",
        "ignored": false
    },
    {
        "slug": "fire-grass-pledge",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shadow-punch",
        "total": 1,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "shin-kick",
        "total": 2,
        "grade": "E",
        "ignored": false
    },
    {
        "slug": "body-slam",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "power-trip",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "fleur-cannon",
        "total": 6,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "lunar-cannon",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "tri-attack",
        "total": 4,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "knock-off",
        "total": 3,
        "grade": "C",
        "ignored": false
    },
    {
        "slug": "iron-fangs",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "egg-bomb",
        "total": 4,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "earth-power",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "sheathed-knife",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "electro-shot",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "meteor-assault",
        "total": 8,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "subduction",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "avalanche",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "snipe-shot",
        "total": 5,
        "grade": "B",
        "ignored": false
    },
    {
        "slug": "dual-wingbeat",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "splash",
        "total": -1,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "sheer-cold",
        "total": -5,
        "grade": "<E",
        "ignored": false
    },
    {
        "slug": "syrup-bomb",
        "total": 7,
        "grade": "A",
        "ignored": false
    },
    {
        "slug": "murky-ray",
        "total": 1,
        "grade": "E",
        "ignored": false
    }
];

const map = data.reduce((acc, move) => {
    acc.set(move.slug, move);
    return acc;
}, new Map<string, {
    total: number;
    grade: string;
    ignored: boolean;
    slug: string;
}>());


const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-moves");
const packDirPaths = fs.readdirSync(packsDataPath).map((dirName) => path.resolve(__dirname, packsDataPath, dirName));

// Loads all packs into memory for the sake of making all document name/id mappings available
for(const p of packDirPaths) {
    const jsonString = fs.readFileSync(p, "utf-8");
    const packSource: Record<string, any> = (() => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            return null;
        }
    })();

    if(packSource && packSource.name) {
        const slug = packSource.system?.slug || sluggify(packSource.name);
        const entry = map.get(slug);
        if(!entry || entry.ignored) continue;
        if(entry.grade == "<E") entry.grade = "E";
        if(isNaN(Number(entry.total))) continue;

        packSource.system.actions[0].cost.powerPoints = entry.total;
        packSource.system.grade = entry.grade;
        packSource.system.actions[0].traits ??= [];
        packSource.system.actions[0].traits.push("pp-updated");

        // Run Migration 101
        if(packSource.img.startsWith("/systems/ptr2e/img/icons/") && packSource.img.endsWith(".png")) {
            packSource.img = packSource.img.replace("/icons/", "/svg/").replace(".png", ".svg");
        }

        if(!packSource.system.actions[0].description) packSource.system.actions[0].description = packSource.system.description;
        packSource.system.description = ""

        fs.writeFileSync(p, JSON.stringify(packSource, null, 2));
    }
}