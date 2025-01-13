import { sluggify } from "build/lib/helpers.ts";
import fs from "fs";
import path from "path";
import url from "url";

const data = [
  {
      "slug": "abrasion",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "acid-armor",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "acid-rain",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "acupressure",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "after-you",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "agility",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "allure",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "alpha-crystal",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "amnesia",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "aqua-ring",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "aromatherapy",
      "cost": 9,
      "grade": "A"
  },
  {
      "slug": "aromatic-mist",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "assist",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "asteroid-belt",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "attract",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "aura-flow",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "aurora-veil",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "autotomize",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "baby-doll-eyes",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "baneful-bunker",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "banish",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "barrier",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "baton-pass",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "battle-cry",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "belly-drum",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "block",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "brace",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "brain-drain",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "briar-patch",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "bulk-up",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "burning-bulwark",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "calcify",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "calm-mind",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "camouflage",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "captivate",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "catalog",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "charge",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "chargen-veins",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "charm",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "chill-out",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "chilly-reception",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "clangorous-soul",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "clear-rain",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "coaching",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "cocoon",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "coil",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "coin-toss",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "cold-shower",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "cold-snap",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "confide",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "confuse-ray",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "conversion",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "conversion-2",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "copycat",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "corrode",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "corrosive-gas",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "corrupt",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "cosmic-power",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "cotton-guard",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "cotton-spore",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "counter",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "court-change",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "crafty-shield",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "crystal-pitch",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "crystallize",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "curse",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "dark-void",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "decorate",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "defend-order",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "defense-curl",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "defog",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "destiny-bond",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "detect",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "disable",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "disturbance",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "doodle",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "double-team",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "dragon-cheer",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "dragon-dance",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "dragonic-furor",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "dragonify",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "dust-guard",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "eagle-eye",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "eerie-impulse",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "electric-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "electrify",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "embargo",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "encore",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "endure",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "entrainment",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "equilibrium",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "extreme-evoboost",
      "cost": 10,
      "grade": "A"
  },
  {
      "slug": "fairy-jinx",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "fairy-lock",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "fake-tears",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "fallout",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "fanfare",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "feather-dance",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "fertility",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "fiery-rouse",
      "cost": 9,
      "grade": "A"
  },
  {
      "slug": "fiesta",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "fillet-away",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "final-gasp",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "flash",
      "cost": 9,
      "grade": "A"
  },
  {
      "slug": "flatter",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "floral-healing",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "flower-shield",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "fluster",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "focus-energy",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "foghorn",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "follow-me",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "foresight",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "forests-curse",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "fortify",
      "cost": 11,
      "grade": "A"
  },
  {
      "slug": "gastro-acid",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "gear-up",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "geomancy",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "ghastly-eye",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "ghostly-touch",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "glare",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "grass-whistle",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "grassy-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "gravity",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "growl",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "growth",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "grudge",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "guard-split",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "guard-swap",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "hail",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "half-life",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "harden",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "haze",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "heal-bell",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "heal-block",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "heal-order",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "heal-pulse",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "healing-wish",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "heart-swap",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "heat-spike",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "helping-hand",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "hemlock",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "hidden-gift",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "hiss",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "hone-claws",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "honor-guard",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "hot-coals",
      "cost": 10,
      "grade": "A"
  },
  {
      "slug": "howl",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "hyperfocus",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "hypnosis",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "imprison",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "indomitable-spirit",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "ingrain",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "instruct",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "invigoration-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "ion-deluge",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "iron-defense",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "jet-stream",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "jump-start",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "jungle-healing",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "kinesis",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "kings-shield",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "laser-focus",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "lava-mine",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "growth",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "leech-seed",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "leer",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "life-dew",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "light-screen",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "livewire",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "lock-on",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "lovely-kiss",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "lucky-chant",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "lunar-blessing",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "lunar-dance",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "magic-coat",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "magic-powder",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "magic-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "magnet-rise",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "magnetic-flux",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "mat-block",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "max-guard",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "me-first",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "mean-look",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "meditate",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "medusa-ray",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "memento",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "metal-sound",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "metronome",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "milk-drink",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "mimic",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "mind-reader",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "minimize",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "miracle-eye",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "mirror-coat",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "mirror-move",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "mist",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "misty-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "moisturize",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "moonlight",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "morning-sun",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "morph",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "mud-sport",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "mystic-dance",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "nanorepair",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "nasty-plot",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "nature-power",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "new-moon",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "nightmare",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "no-retreat",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "noble-roar",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "nuclear-waste",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "null-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "obstruct",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "octolock",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "odor-sleuth",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "oil-slick",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "pacify",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "pain-split",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "paralytic-venom",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "parodize",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "parting-shot",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "peaking-shriek",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "pepper-powder",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "perish-song",
      "cost": 10,
      "grade": "A"
  },
  {
      "slug": "permafrost",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "pixie-dust",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "play-nice",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "poison-gas",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "poison-powder",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "powder",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "power-shift",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "power-split",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "power-swap",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "power-trick",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "protect",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "psych-up",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "psychic-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "psycho-shift",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "purify",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "puzzle-powder",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "quash",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "quick-guard",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "quicksand",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "quiver-dance",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "radioleach",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "rage-powder",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "rain-dance",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "recharge",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "recover",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "recycle",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "reflect",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "reflect-type",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "refocus",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "refresh",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "refreshing-field",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "rest",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "retrograde",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "reverb-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "revival-blessing",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "roar",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "rock-polish",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "rocky-rebuff",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "role-play",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "roost",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "rototiller",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "sacrificial-blessing",
      "cost": 10,
      "grade": "A"
  },
  {
      "slug": "safeguard",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sanctified-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sand-attack",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sandstorm",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "scary-face",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "schadenfreude",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "scorched-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "screech",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "shadow-boost",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "shadow-down",
      "cost": 9,
      "grade": "A"
  },
  {
      "slug": "shadow-half",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "shadow-hold",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "shadow-lift",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "shadow-mist",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "shadow-panic",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "shadow-shed",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "shadow-sky",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "sharpen",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "shed-tail",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "shell-smash",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "shelter",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "shift-gear",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "shiver",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "shock-wall",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "shore-up",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "silk-trap",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "simple-beam",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "sing",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "singularity",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sketch",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "skill-swap",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "slack-off",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "sleep-powder",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "sleep-talk",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "smokescreen",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "snapshot",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "snatch",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "snowscape",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "soak",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "soft-boiled",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "speed-swap",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "spicy-extract",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "spider-web",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "spikes",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "spiky-shield",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "spite",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "spore",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "spotlight",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "stand-off",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "stealth-rock",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sticky-terrain",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "sticky-web",
      "cost": 9,
      "grade": "A"
  },
  {
      "slug": "stockpile",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "stoke",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "strength-sap",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "string-shot",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "stuff-cheeks",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "stun-spore",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "substitute",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "sunny-day",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "super-fang",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "supercharge",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "supersonic",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "swagger",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "sweet-kiss",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "sweet-scent",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "switcheroo",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "swords-dance",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "synthesis",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "tail-glow",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "tail-whip",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "tailwind",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "tar-shot",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "taunt",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "tearful-look",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "teatime",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "teeter-dance",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "telekinesis",
      "cost": 6,
      "grade": "B"
  },
  {
      "slug": "teleport",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "tetra-guard",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "thunder-wave",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "tickle",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "tidy-up",
      "cost": 6,
      "grade": "A"
  },
  {
      "slug": "time-out",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "topsy-turvy",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "torment",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "toxic",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "toxic-spikes",
      "cost": 8,
      "grade": "A"
  },
  {
      "slug": "toxic-thread",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "tractor-beam",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "transform",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "trick",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "trick-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "trick-or-treat",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "turbulence",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "unshackled-mind",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "venom-drench",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "victory-dance",
      "cost": 5,
      "grade": "B"
  },
  {
      "slug": "viral-gale",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "water-sport",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "waterlog",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "whirlwind",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "wide-guard",
      "cost": 3,
      "grade": "D"
  },
  {
      "slug": "wild-shriek",
      "cost": 7,
      "grade": "A"
  },
  {
      "slug": "wildfire",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "will-o-wisp",
      "cost": 2,
      "grade": "E"
  },
  {
      "slug": "wish",
      "cost": 2,
      "grade": "D"
  },
  {
      "slug": "withdraw",
      "cost": 1,
      "grade": "E"
  },
  {
      "slug": "wonder-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "work-up",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "worry-seed",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "yawn",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "z-pose",
      "cost": 4,
      "grade": "B"
  },
  {
      "slug": "zenith-power",
      "cost": 4,
      "grade": "C"
  },
  {
      "slug": "zero-room",
      "cost": 3,
      "grade": "C"
  },
  {
      "slug": "zombify",
      "cost": 3,
      "grade": "D"
  }
];

const moveMap = new Map(data.map(data => [data.slug, data]));

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-moves");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!data.system) throw new Error(`Missing system data in ${filePath}`);

  const moveData = moveMap.get(data.slug ?? data.system.slug) ?? moveMap.get(sluggify(data.name));
  if(!moveData) continue; // throw new Error(`Move not found for ${filePath}`);

  const actions = data.system.actions;
  if(!actions.length) throw new Error(`Missing actions in ${filePath}`);
  if(actions.length > 1) {
    const primary = actions.find((a: {slug: string}) => a.slug === data.system.slug) ?? actions[0];
    if(!primary) throw new Error(`Missing primary action in ${filePath}`);

    if(!primary.cost) primary.cost = {activation: "complex", powerPoints: moveData.cost}
    else primary.cost.powerPoints = moveData.cost;
    primary.traits ??= [];
    primary.traits.push("pp-updated");
  }
  else {
    const action = actions[0];
    if(!action.cost) action.cost = {activation: "complex", powerPoints: moveData.cost}
    else action.cost.powerPoints = moveData.cost;
    action.traits ??= [];
    action.traits.push("pp-updated");
  }
  data.system.grade = moveData.grade;
  data.system.traits ??= [];
  data.system.traits.push("pp-updated");

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}