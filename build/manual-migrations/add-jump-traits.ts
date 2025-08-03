import fs from "fs";
import path from "path";
import url from "url";

const data = [
  {
      "number": 1,
      "species": "Bulbasaur",
      "jump": "jump-3"
  },
  {
      "number": 2,
      "species": "Ivysaur",
      "jump": "jump-3"
  },
  {
      "number": 3,
      "species": "Venusaur",
      "jump": "jump-2"
  },
  {
      "number": 3,
      "species": "Venusaur Mega",
      "jump": "jump-1"
  },
  {
      "number": 4,
      "species": "Charmander",
      "jump": "jump-3"
  },
  {
      "number": 5,
      "species": "Charmeleon",
      "jump": "jump-3"
  },
  {
      "number": 6,
      "species": "Charizard",
      "jump": "jump-2"
  },
  {
      "number": 6,
      "species": "Charizard Mega X",
      "jump": "jump-4"
  },
  {
      "number": 6,
      "species": "Charizard Mega Y",
      "jump": "jump-3"
  },
  {
      "number": 7,
      "species": "Squirtle",
      "jump": "jump-3"
  },
  {
      "number": 8,
      "species": "Wartortle",
      "jump": "jump-3"
  },
  {
      "number": 9,
      "species": "Blastoise",
      "jump": "jump-1"
  },
  {
      "number": 9,
      "species": "Blastoise Mega",
      "jump": "jump-1"
  },
  {
      "number": 10,
      "species": "Caterpie",
      "jump": "jump-2"
  },
  {
      "number": 11,
      "species": "Metapod",
      "jump": "jump-5"
  },
  {
      "number": 12,
      "species": "Butterfree",
      "jump": "jump-3"
  },
  {
      "number": 13,
      "species": "Weedle",
      "jump": "jump-2"
  },
  {
      "number": 14,
      "species": "Kakuna",
      "jump": "jump-5"
  },
  {
      "number": 15,
      "species": "Beedrill",
      "jump": "jump-4"
  },
  {
      "number": 15,
      "species": "Beedrill Mega",
      "jump": ""
  },
  {
      "number": 16,
      "species": "Pidgey",
      "jump": "jump-4"
  },
  {
      "number": 17,
      "species": "Pidgeotto",
      "jump": "jump-4"
  },
  {
      "number": 18,
      "species": "Pidgeot",
      "jump": "jump-3"
  },
  {
      "number": 18,
      "species": "Pidgeot Mega",
      "jump": "jump-3"
  },
  {
      "number": 19,
      "species": "Rattata",
      "jump": "jump-6"
  },
  {
      "number": 19,
      "species": "Rattata Alolan",
      "jump": "jump-6"
  },
  {
      "number": 20,
      "species": "Raticate",
      "jump": "jump-5"
  },
  {
      "number": 20,
      "species": "Raticate Alolan",
      "jump": "jump-5"
  },
  {
      "number": 21,
      "species": "Spearow",
      "jump": "jump-4"
  },
  {
      "number": 22,
      "species": "Fearow",
      "jump": "jump-3"
  },
  {
      "number": 23,
      "species": "Ekans",
      "jump": "jump-2"
  },
  {
      "number": 24,
      "species": "Arbok",
      "jump": "jump-2"
  },
  {
      "number": 25,
      "species": "Pikachu",
      "jump": "jump-6"
  },
  {
      "number": 26,
      "species": "Raichu",
      "jump": "jump-5"
  },
  {
      "number": 26,
      "species": "Raichu Alolan",
      "jump": "jump-4"
  },
  {
      "number": 27,
      "species": "Sandshrew",
      "jump": "jump-5"
  },
  {
      "number": 27,
      "species": "Sandshrew Alolan",
      "jump": "jump-3"
  },
  {
      "number": 28,
      "species": "Sandslash",
      "jump": "jump-3"
  },
  {
      "number": 28,
      "species": "Sandslash Alolan",
      "jump": "jump-2"
  },
  {
      "number": 29,
      "species": "Nidoran Male",
      "jump": "jump-5"
  },
  {
      "number": 30,
      "species": "Nidorina",
      "jump": "jump-4"
  },
  {
      "number": 31,
      "species": "Nidoqueen",
      "jump": "jump-2"
  },
  {
      "number": 32,
      "species": "Nidoran Female",
      "jump": "jump-5"
  },
  {
      "number": 33,
      "species": "Nidorino",
      "jump": "jump-4"
  },
  {
      "number": 34,
      "species": "Nidoking",
      "jump": "jump-2"
  },
  {
      "number": 35,
      "species": "Clefairy",
      "jump": "jump-3"
  },
  {
      "number": 36,
      "species": "Clefable",
      "jump": "jump-2"
  },
  {
      "number": 37,
      "species": "Vulpix",
      "jump": "jump-5"
  },
  {
      "number": 37,
      "species": "Vulpix Alolan",
      "jump": "jump-5"
  },
  {
      "number": 38,
      "species": "Ninetales",
      "jump": "jump-5"
  },
  {
      "number": 38,
      "species": "Ninetales Alolan",
      "jump": "jump-5"
  },
  {
      "number": 39,
      "species": "Jigglypuff",
      "jump": "jump-3"
  },
  {
      "number": 40,
      "species": "Wigglytuff",
      "jump": "jump-3"
  },
  {
      "number": 41,
      "species": "Zubat",
      "jump": "jump-1"
  },
  {
      "number": 42,
      "species": "Golbat",
      "jump": "jump-2"
  },
  {
      "number": 43,
      "species": "Oddish",
      "jump": "jump-3"
  },
  {
      "number": 44,
      "species": "Gloom",
      "jump": "jump-2"
  },
  {
      "number": 45,
      "species": "Vileplume",
      "jump": "jump-2"
  },
  {
      "number": 46,
      "species": "Paras",
      "jump": "jump-3"
  },
  {
      "number": 47,
      "species": "Parasect",
      "jump": "jump-1"
  },
  {
      "number": 48,
      "species": "Venonat",
      "jump": "jump-3"
  },
  {
      "number": 49,
      "species": "Venomoth",
      "jump": "jump-2"
  },
  {
      "number": 50,
      "species": "Diglett",
      "jump": ""
  },
  {
      "number": 50,
      "species": "Diglett Alolan",
      "jump": ""
  },
  {
      "number": 51,
      "species": "Dugtrio",
      "jump": ""
  },
  {
      "number": 51,
      "species": "Dugtrio Alolan",
      "jump": ""
  },
  {
      "number": 52,
      "species": "Meowth",
      "jump": "jump-6"
  },
  {
      "number": 52,
      "species": "Meowth Alolan",
      "jump": "jump-5"
  },
  {
      "number": 52,
      "species": "Meowth Galarian",
      "jump": "jump-5"
  },
  {
      "number": 53,
      "species": "Persian",
      "jump": "jump-6"
  },
  {
      "number": 53,
      "species": "Persian Alolan",
      "jump": "jump-5"
  },
  {
      "number": 54,
      "species": "Psyduck",
      "jump": "jump-2"
  },
  {
      "number": 55,
      "species": "Golduck",
      "jump": "jump-3"
  },
  {
      "number": 56,
      "species": "Mankey",
      "jump": "jump-6"
  },
  {
      "number": 57,
      "species": "Primeape",
      "jump": "jump-5"
  },
  {
      "number": 58,
      "species": "Growlithe",
      "jump": "jump-5"
  },
  {
      "number": 58,
      "species": "Growlithe Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 59,
      "species": "Arcanine",
      "jump": "jump-5"
  },
  {
      "number": 59,
      "species": "Arcanine Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 60,
      "species": "Poliwag",
      "jump": "jump-1"
  },
  {
      "number": 61,
      "species": "Poliwhirl",
      "jump": "jump-2"
  },
  {
      "number": 62,
      "species": "Poliwrath",
      "jump": "jump-4"
  },
  {
      "number": 63,
      "species": "Abra",
      "jump": "jump-2"
  },
  {
      "number": 64,
      "species": "Kadabra",
      "jump": "jump-2"
  },
  {
      "number": 65,
      "species": "Alakazam",
      "jump": "jump-2"
  },
  {
      "number": 65,
      "species": "Alakazam Mega",
      "jump": "jump-1"
  },
  {
      "number": 66,
      "species": "Machop",
      "jump": "jump-3"
  },
  {
      "number": 67,
      "species": "Machoke",
      "jump": "jump-3"
  },
  {
      "number": 68,
      "species": "Machamp",
      "jump": "jump-3"
  },
  {
      "number": 69,
      "species": "Bellsprout",
      "jump": "jump-1"
  },
  {
      "number": 70,
      "species": "Weepinbell",
      "jump": "jump-2"
  },
  {
      "number": 71,
      "species": "Victreebel",
      "jump": "jump-2"
  },
  {
      "number": 72,
      "species": "Tentacool",
      "jump": "jump-3"
  },
  {
      "number": 73,
      "species": "Tentacruel",
      "jump": "jump-4"
  },
  {
      "number": 74,
      "species": "Geodude",
      "jump": "jump-3"
  },
  {
      "number": 74,
      "species": "Geodude Alolan",
      "jump": "jump-3"
  },
  {
      "number": 75,
      "species": "Graveler",
      "jump": "jump-2"
  },
  {
      "number": 75,
      "species": "Graveler Alolan",
      "jump": "jump-2"
  },
  {
      "number": 76,
      "species": "Golem",
      "jump": "jump-1"
  },
  {
      "number": 76,
      "species": "Golem Alolan",
      "jump": "jump-1"
  },
  {
      "number": 77,
      "species": "Ponyta",
      "jump": "jump-4"
  },
  {
      "number": 77,
      "species": "Ponyta Galarian",
      "jump": "jump-4"
  },
  {
      "number": 78,
      "species": "Rapidash",
      "jump": "jump-4"
  },
  {
      "number": 78,
      "species": "Rapidash Galarian",
      "jump": "jump-4"
  },
  {
      "number": 79,
      "species": "Slowpoke",
      "jump": "jump-1"
  },
  {
      "number": 79,
      "species": "Slowpoke Galarian",
      "jump": "jump-1"
  },
  {
      "number": 80,
      "species": "Slowbro",
      "jump": "jump-1"
  },
  {
      "number": 80,
      "species": "Slowbro Galarian",
      "jump": "jump-1"
  },
  {
      "number": 80,
      "species": "Slowbro Mega",
      "jump": "jump-1"
  },
  {
      "number": 81,
      "species": "Magnemite",
      "jump": ""
  },
  {
      "number": 82,
      "species": "Magneton",
      "jump": ""
  },
  {
      "number": 83,
      "species": "Farfetch'd",
      "jump": "jump-3"
  },
  {
      "number": 83,
      "species": "Farfetch'd Galarian",
      "jump": "jump-2"
  },
  {
      "number": 84,
      "species": "Doduo",
      "jump": "jump-3"
  },
  {
      "number": 85,
      "species": "Dodrio",
      "jump": "jump-4"
  },
  {
      "number": 86,
      "species": "Seel",
      "jump": "jump-1"
  },
  {
      "number": 87,
      "species": "Dewgong",
      "jump": "jump-1"
  },
  {
      "number": 88,
      "species": "Grimer",
      "jump": "jump-1"
  },
  {
      "number": 88,
      "species": "Grimer Alolan",
      "jump": "jump-1"
  },
  {
      "number": 89,
      "species": "Muk",
      "jump": "jump-1"
  },
  {
      "number": 89,
      "species": "Muk Alolan",
      "jump": "jump-1"
  },
  {
      "number": 90,
      "species": "Shellder",
      "jump": "jump-2"
  },
  {
      "number": 91,
      "species": "Cloyster",
      "jump": "jump-2"
  },
  {
      "number": 92,
      "species": "Gastly",
      "jump": ""
  },
  {
      "number": 93,
      "species": "Haunter",
      "jump": ""
  },
  {
      "number": 94,
      "species": "Gengar",
      "jump": "jump-3"
  },
  {
      "number": 94,
      "species": "Gengar Mega",
      "jump": "jump-1"
  },
  {
      "number": 95,
      "species": "Onix",
      "jump": "jump-2"
  },
  {
      "number": 96,
      "species": "Drowzee",
      "jump": "jump-2"
  },
  {
      "number": 97,
      "species": "Hypno",
      "jump": "jump-2"
  },
  {
      "number": 98,
      "species": "Krabby",
      "jump": "jump-5"
  },
  {
      "number": 99,
      "species": "Kingler",
      "jump": "jump-3"
  },
  {
      "number": 100,
      "species": "Voltorb",
      "jump": "jump-4"
  },
  {
      "number": 100,
      "species": "Voltorb Hisuian",
      "jump": "jump-4"
  },
  {
      "number": 101,
      "species": "Electrode",
      "jump": "jump-4"
  },
  {
      "number": 101,
      "species": "Electrode Hisuian",
      "jump": "jump-4"
  },
  {
      "number": 102,
      "species": "Exeggcute",
      "jump": "jump-3"
  },
  {
      "number": 103,
      "species": "Exeggutor",
      "jump": "jump-2"
  },
  {
      "number": 103,
      "species": "Exeggutor Alolan",
      "jump": "jump-1"
  },
  {
      "number": 104,
      "species": "Cubone",
      "jump": "jump-3"
  },
  {
      "number": 105,
      "species": "Marowak",
      "jump": "jump-3"
  },
  {
      "number": 105,
      "species": "Marowak Alolan",
      "jump": "jump-3"
  },
  {
      "number": 106,
      "species": "Hitmonlee",
      "jump": "jump-5"
  },
  {
      "number": 107,
      "species": "Hitmonchan",
      "jump": "jump-3"
  },
  {
      "number": 108,
      "species": "Lickitung",
      "jump": "jump-2"
  },
  {
      "number": 109,
      "species": "Koffing",
      "jump": ""
  },
  {
      "number": 110,
      "species": "Weezing",
      "jump": ""
  },
  {
      "number": 110,
      "species": "Weezing Galarian",
      "jump": ""
  },
  {
      "number": 111,
      "species": "Rhyhorn",
      "jump": "jump-2"
  },
  {
      "number": 112,
      "species": "Rhydon",
      "jump": "jump-2"
  },
  {
      "number": 113,
      "species": "Chansey",
      "jump": "jump-2"
  },
  {
      "number": 114,
      "species": "Tangela",
      "jump": "jump-3"
  },
  {
      "number": 115,
      "species": "Kangaskhan",
      "jump": "jump-2"
  },
  {
      "number": 115,
      "species": "Kangaskhan Mega",
      "jump": "jump-2"
  },
  {
      "number": 116,
      "species": "Horsea",
      "jump": "jump-1"
  },
  {
      "number": 117,
      "species": "Seadra",
      "jump": "jump-1"
  },
  {
      "number": 118,
      "species": "Goldeen",
      "jump": "jump-1"
  },
  {
      "number": 119,
      "species": "Seaking",
      "jump": "jump-1"
  },
  {
      "number": 120,
      "species": "Staryu",
      "jump": "jump-3"
  },
  {
      "number": 121,
      "species": "Starmie",
      "jump": "jump-3"
  },
  {
      "number": 122,
      "species": "Mr. Mime",
      "jump": "jump-2"
  },
  {
      "number": 122,
      "species": "Mr. Mime Galarian",
      "jump": "jump-2"
  },
  {
      "number": 123,
      "species": "Scyther",
      "jump": "jump-4"
  },
  {
      "number": 124,
      "species": "Jynx",
      "jump": "jump-2"
  },
  {
      "number": 125,
      "species": "Electabuzz",
      "jump": "jump-3"
  },
  {
      "number": 126,
      "species": "Magmar",
      "jump": "jump-3"
  },
  {
      "number": 127,
      "species": "Pinsir",
      "jump": "jump-2"
  },
  {
      "number": 127,
      "species": "Pinsir Mega",
      "jump": "jump-2"
  },
  {
      "number": 128,
      "species": "Tauros",
      "jump": "jump-4"
  },
  {
      "number": 128,
      "species": "Tauros Paldean Aqua Breed",
      "jump": "jump-4"
  },
  {
      "number": 128,
      "species": "Tauros Paldean Blaze Breed",
      "jump": "jump-4"
  },
  {
      "number": 128,
      "species": "Tauros Paldean Combat Breed",
      "jump": "jump-4"
  },
  {
      "number": 129,
      "species": "Magikarp",
      "jump": "jump-8"
  },
  {
      "number": 130,
      "species": "Gyarados",
      "jump": "jump-3"
  },
  {
      "number": 130,
      "species": "Gyarados Mega",
      "jump": "jump-4"
  },
  {
      "number": 131,
      "species": "Lapras",
      "jump": "jump-1"
  },
  {
      "number": 132,
      "species": "Ditto",
      "jump": "jump-1"
  },
  {
      "number": 133,
      "species": "Eevee",
      "jump": "jump-5"
  },
  {
      "number": 134,
      "species": "Vaporeon",
      "jump": "jump-4"
  },
  {
      "number": 135,
      "species": "Jolteon",
      "jump": "jump-4"
  },
  {
      "number": 136,
      "species": "Flareon",
      "jump": "jump-4"
  },
  {
      "number": 137,
      "species": "Porygon",
      "jump": ""
  },
  {
      "number": 138,
      "species": "Omanyte",
      "jump": "jump-3"
  },
  {
      "number": 139,
      "species": "Omastar",
      "jump": "jump-2"
  },
  {
      "number": 140,
      "species": "Kabuto",
      "jump": "jump-2"
  },
  {
      "number": 141,
      "species": "Kabutops",
      "jump": "jump-3"
  },
  {
      "number": 142,
      "species": "Aerodactyl",
      "jump": "jump-5"
  },
  {
      "number": 142,
      "species": "Aerodactyl Mega",
      "jump": "jump-5"
  },
  {
      "number": 143,
      "species": "Snorlax",
      "jump": "jump-1"
  },
  {
      "number": 144,
      "species": "Articuno",
      "jump": "jump-2"
  },
  {
      "number": 144,
      "species": "Articuno Galarian",
      "jump": "jump-2"
  },
  {
      "number": 145,
      "species": "Zapdos",
      "jump": "jump-2"
  },
  {
      "number": 145,
      "species": "Zapdos Galarian",
      "jump": "jump-5"
  },
  {
      "number": 146,
      "species": "Moltres",
      "jump": "jump-2"
  },
  {
      "number": 146,
      "species": "Moltres Galarian",
      "jump": "jump-2"
  },
  {
      "number": 147,
      "species": "Dratini",
      "jump": "jump-3"
  },
  {
      "number": 148,
      "species": "Dragonair",
      "jump": "jump-3"
  },
  {
      "number": 149,
      "species": "Dragonite",
      "jump": "jump-2"
  },
  {
      "number": 150,
      "species": "Mewtwo",
      "jump": "jump-2"
  },
  {
      "number": 150,
      "species": "Mewtwo Mega X",
      "jump": "jump-4"
  },
  {
      "number": 150,
      "species": "Mewtwo Mega Y",
      "jump": "jump-2"
  },
  {
      "number": 151,
      "species": "Mew",
      "jump": "jump-4"
  },
  {
      "number": 152,
      "species": "Chikorita",
      "jump": "jump-3"
  },
  {
      "number": 153,
      "species": "Bayleef",
      "jump": "jump-2"
  },
  {
      "number": 154,
      "species": "Meganium",
      "jump": "jump-2"
  },
  {
      "number": 155,
      "species": "Cyndaquil",
      "jump": "jump-4"
  },
  {
      "number": 156,
      "species": "Quilava",
      "jump": "jump-4"
  },
  {
      "number": 157,
      "species": "Typhlosion",
      "jump": "jump-3"
  },
  {
      "number": 157,
      "species": "Typhlosion Hisuian",
      "jump": "jump-3"
  },
  {
      "number": 158,
      "species": "Totodile",
      "jump": "jump-3"
  },
  {
      "number": 159,
      "species": "Croconaw",
      "jump": "jump-2"
  },
  {
      "number": 160,
      "species": "Feraligatr",
      "jump": "jump-2"
  },
  {
      "number": 161,
      "species": "Sentret",
      "jump": "jump-5"
  },
  {
      "number": 162,
      "species": "Furret",
      "jump": "jump-5"
  },
  {
      "number": 163,
      "species": "Hoothoot",
      "jump": "jump-3"
  },
  {
      "number": 164,
      "species": "Noctowl",
      "jump": "jump-2"
  },
  {
      "number": 165,
      "species": "Ledyba",
      "jump": "jump-4"
  },
  {
      "number": 166,
      "species": "Ledian",
      "jump": "jump-3"
  },
  {
      "number": 167,
      "species": "Spinarak",
      "jump": "jump-8"
  },
  {
      "number": 168,
      "species": "Ariados",
      "jump": "jump-7"
  },
  {
      "number": 169,
      "species": "Crobat",
      "jump": "jump-1"
  },
  {
      "number": 170,
      "species": "Chinchou",
      "jump": "jump-2"
  },
  {
      "number": 171,
      "species": "Lanturn",
      "jump": "jump-1"
  },
  {
      "number": 172,
      "species": "Pichu",
      "jump": "jump-5"
  },
  {
      "number": 173,
      "species": "Cleffa",
      "jump": "jump-3"
  },
  {
      "number": 174,
      "species": "Igglybuff",
      "jump": "jump-3"
  },
  {
      "number": 175,
      "species": "Togepi",
      "jump": "jump-1"
  },
  {
      "number": 176,
      "species": "Togetic",
      "jump": "jump-3"
  },
  {
      "number": 177,
      "species": "Natu",
      "jump": "jump-4"
  },
  {
      "number": 178,
      "species": "Xatu",
      "jump": "jump-2"
  },
  {
      "number": 179,
      "species": "Mareep",
      "jump": "jump-4"
  },
  {
      "number": 180,
      "species": "Flaaffy",
      "jump": "jump-3"
  },
  {
      "number": 181,
      "species": "Ampharos",
      "jump": "jump-2"
  },
  {
      "number": 181,
      "species": "Ampharos Mega",
      "jump": "jump-2"
  },
  {
      "number": 182,
      "species": "Bellossom",
      "jump": "jump-4"
  },
  {
      "number": 183,
      "species": "Marill",
      "jump": "jump-4"
  },
  {
      "number": 184,
      "species": "Azumarill",
      "jump": "jump-3"
  },
  {
      "number": 185,
      "species": "Sudowoodo",
      "jump": "jump-2"
  },
  {
      "number": 186,
      "species": "Politoed",
      "jump": "jump-4"
  },
  {
      "number": 187,
      "species": "Hoppip",
      "jump": "jump-2"
  },
  {
      "number": 188,
      "species": "Skiploom",
      "jump": "jump-2"
  },
  {
      "number": 189,
      "species": "Jumpluff",
      "jump": "jump-2"
  },
  {
      "number": 190,
      "species": "Aipom",
      "jump": "jump-6"
  },
  {
      "number": 191,
      "species": "Sunkern",
      "jump": "jump-1"
  },
  {
      "number": 192,
      "species": "Sunflora",
      "jump": "jump-2"
  },
  {
      "number": 193,
      "species": "Yanma",
      "jump": "jump-1"
  },
  {
      "number": 194,
      "species": "Wooper",
      "jump": "jump-3"
  },
  {
      "number": 194,
      "species": "Wooper Paldean",
      "jump": "jump-3"
  },
  {
      "number": 195,
      "species": "Quagsire",
      "jump": "jump-2"
  },
  {
      "number": 196,
      "species": "Espeon",
      "jump": "jump-4"
  },
  {
      "number": 197,
      "species": "Umbreon",
      "jump": "jump-4"
  },
  {
      "number": 198,
      "species": "Murkrow",
      "jump": "jump-2"
  },
  {
      "number": 199,
      "species": "Slowking",
      "jump": "jump-1"
  },
  {
      "number": 199,
      "species": "Slowking Galarian",
      "jump": "jump-1"
  },
  {
      "number": 200,
      "species": "Misdreavus",
      "jump": ""
  },
  {
      "number": 201,
      "species": "Unown",
      "jump": ""
  },
  {
      "number": 202,
      "species": "Wobbuffet",
      "jump": "jump-1"
  },
  {
      "number": 203,
      "species": "Girafarig",
      "jump": "jump-3"
  },
  {
      "number": 204,
      "species": "Pineco",
      "jump": "jump-4"
  },
  {
      "number": 205,
      "species": "Forretress",
      "jump": ""
  },
  {
      "number": 206,
      "species": "Dunsparce",
      "jump": "jump-3"
  },
  {
      "number": 207,
      "species": "Gligar",
      "jump": "jump-3"
  },
  {
      "number": 208,
      "species": "Steelix",
      "jump": "jump-2"
  },
  {
      "number": 208,
      "species": "Steelix Mega",
      "jump": "jump-2"
  },
  {
      "number": 209,
      "species": "Snubbull",
      "jump": "jump-4"
  },
  {
      "number": 210,
      "species": "Granbull",
      "jump": "jump-3"
  },
  {
      "number": 211,
      "species": "Qwilfish",
      "jump": "jump-1"
  },
  {
      "number": 211,
      "species": "Qwilfish Hisuian",
      "jump": "jump-1"
  },
  {
      "number": 212,
      "species": "Scizor",
      "jump": "jump-5"
  },
  {
      "number": 212,
      "species": "Scizor Mega",
      "jump": "jump-5"
  },
  {
      "number": 213,
      "species": "Shuckle",
      "jump": "jump-1"
  },
  {
      "number": 214,
      "species": "Heracross",
      "jump": "jump-3"
  },
  {
      "number": 214,
      "species": "Heracross Mega",
      "jump": "jump-2"
  },
  {
      "number": 215,
      "species": "Sneasel",
      "jump": "jump-5"
  },
  {
      "number": 215,
      "species": "Sneasel Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 216,
      "species": "Teddiursa",
      "jump": "jump-3"
  },
  {
      "number": 217,
      "species": "Ursaring",
      "jump": "jump-2"
  },
  {
      "number": 218,
      "species": "Slugma",
      "jump": "jump-1"
  },
  {
      "number": 219,
      "species": "Magcargo",
      "jump": "jump-1"
  },
  {
      "number": 220,
      "species": "Swinub",
      "jump": "jump-4"
  },
  {
      "number": 221,
      "species": "Piloswine",
      "jump": "jump-2"
  },
  {
      "number": 222,
      "species": "Corsola",
      "jump": "jump-3"
  },
  {
      "number": 222,
      "species": "Corsola Galarian",
      "jump": "jump-2"
  },
  {
      "number": 223,
      "species": "Remoraid",
      "jump": "jump-3"
  },
  {
      "number": 224,
      "species": "Octillery",
      "jump": "jump-1"
  },
  {
      "number": 225,
      "species": "Delibird",
      "jump": "jump-4"
  },
  {
      "number": 226,
      "species": "Mantine",
      "jump": "jump-1"
  },
  {
      "number": 227,
      "species": "Skarmory",
      "jump": "jump-3"
  },
  {
      "number": 228,
      "species": "Houndour",
      "jump": "jump-5"
  },
  {
      "number": 229,
      "species": "Houndoom",
      "jump": "jump-5"
  },
  {
      "number": 229,
      "species": "Houndoom Mega",
      "jump": "jump-5"
  },
  {
      "number": 230,
      "species": "Kingdra",
      "jump": "jump-1"
  },
  {
      "number": 231,
      "species": "Phanpy",
      "jump": "jump-2"
  },
  {
      "number": 232,
      "species": "Donphan",
      "jump": "jump-2"
  },
  {
      "number": 233,
      "species": "Porygon2",
      "jump": ""
  },
  {
      "number": 234,
      "species": "Stantler",
      "jump": "jump-4"
  },
  {
      "number": 235,
      "species": "Smeargle",
      "jump": "jump-2"
  },
  {
      "number": 236,
      "species": "Tyrogue",
      "jump": "jump-2"
  },
  {
      "number": 237,
      "species": "Hitmontop",
      "jump": "jump-4"
  },
  {
      "number": 238,
      "species": "Smoochum",
      "jump": "jump-3"
  },
  {
      "number": 239,
      "species": "Elekid",
      "jump": "jump-4"
  },
  {
      "number": 240,
      "species": "Magby",
      "jump": "jump-4"
  },
  {
      "number": 241,
      "species": "Miltank",
      "jump": "jump-3"
  },
  {
      "number": 242,
      "species": "Blissey",
      "jump": "jump-2"
  },
  {
      "number": 243,
      "species": "Raikou",
      "jump": "jump-6"
  },
  {
      "number": 244,
      "species": "Entei",
      "jump": "jump-6"
  },
  {
      "number": 245,
      "species": "Suicune",
      "jump": "jump-6"
  },
  {
      "number": 246,
      "species": "Larvitar",
      "jump": "jump-3"
  },
  {
      "number": 247,
      "species": "Pupitar",
      "jump": "jump-5"
  },
  {
      "number": 248,
      "species": "Tyranitar",
      "jump": "jump-1"
  },
  {
      "number": 248,
      "species": "Tyranitar Mega",
      "jump": "jump-1"
  },
  {
      "number": 249,
      "species": "Lugia",
      "jump": "jump-2"
  },
  {
      "number": 250,
      "species": "Ho-Oh",
      "jump": "jump-2"
  },
  {
      "number": 251,
      "species": "Celebi",
      "jump": "jump-4"
  },
  {
      "number": 252,
      "species": "Treecko",
      "jump": "jump-5"
  },
  {
      "number": 253,
      "species": "Grovyle",
      "jump": "jump-5"
  },
  {
      "number": 254,
      "species": "Sceptile",
      "jump": "jump-5"
  },
  {
      "number": 254,
      "species": "Sceptile Mega",
      "jump": "jump-5"
  },
  {
      "number": 255,
      "species": "Torchic",
      "jump": "jump-5"
  },
  {
      "number": 256,
      "species": "Combusken",
      "jump": "jump-5"
  },
  {
      "number": 257,
      "species": "Blaziken",
      "jump": "jump-5"
  },
  {
      "number": 257,
      "species": "Blaziken Mega",
      "jump": "jump-5"
  },
  {
      "number": 258,
      "species": "Mudkip",
      "jump": "jump-4"
  },
  {
      "number": 259,
      "species": "Marshtomp",
      "jump": "jump-2"
  },
  {
      "number": 260,
      "species": "Swampert",
      "jump": "jump-2"
  },
  {
      "number": 260,
      "species": "Swampert Mega",
      "jump": "jump-1"
  },
  {
      "number": 261,
      "species": "Poochyena",
      "jump": "jump-5"
  },
  {
      "number": 262,
      "species": "Mightyena",
      "jump": "jump-4"
  },
  {
      "number": 263,
      "species": "Zigzagoon",
      "jump": "jump-5"
  },
  {
      "number": 263,
      "species": "Zigzagoon Galarian",
      "jump": "jump-5"
  },
  {
      "number": 264,
      "species": "Linoone",
      "jump": "jump-5"
  },
  {
      "number": 264,
      "species": "Linoone Galarian",
      "jump": "jump-5"
  },
  {
      "number": 265,
      "species": "Wurmple",
      "jump": "jump-2"
  },
  {
      "number": 266,
      "species": "Silcoon",
      "jump": "jump-3"
  },
  {
      "number": 267,
      "species": "Beautifly",
      "jump": "jump-2"
  },
  {
      "number": 268,
      "species": "Cascoon",
      "jump": "jump-3"
  },
  {
      "number": 269,
      "species": "Dustox",
      "jump": "jump-2"
  },
  {
      "number": 270,
      "species": "Lotad",
      "jump": "jump-1"
  },
  {
      "number": 271,
      "species": "Lombre",
      "jump": "jump-2"
  },
  {
      "number": 272,
      "species": "Ludicolo",
      "jump": "jump-4"
  },
  {
      "number": 273,
      "species": "Seedot",
      "jump": "jump-2"
  },
  {
      "number": 274,
      "species": "Nuzleaf",
      "jump": "jump-2"
  },
  {
      "number": 275,
      "species": "Shiftry",
      "jump": "jump-5"
  },
  {
      "number": 276,
      "species": "Taillow",
      "jump": "jump-4"
  },
  {
      "number": 277,
      "species": "Swellow",
      "jump": "jump-4"
  },
  {
      "number": 278,
      "species": "Wingull",
      "jump": "jump-3"
  },
  {
      "number": 279,
      "species": "Pelipper",
      "jump": "jump-1"
  },
  {
      "number": 280,
      "species": "Ralts",
      "jump": "jump-2"
  },
  {
      "number": 281,
      "species": "Kirlia",
      "jump": "jump-4"
  },
  {
      "number": 282,
      "species": "Gardevoir",
      "jump": "jump-3"
  },
  {
      "number": 282,
      "species": "Gardevoir Mega",
      "jump": "jump-3"
  },
  {
      "number": 283,
      "species": "Surskit",
      "jump": "jump-2"
  },
  {
      "number": 284,
      "species": "Masquerain",
      "jump": "jump-1"
  },
  {
      "number": 285,
      "species": "Shroomish",
      "jump": "jump-3"
  },
  {
      "number": 286,
      "species": "Breloom",
      "jump": "jump-5"
  },
  {
      "number": 287,
      "species": "Slakoth",
      "jump": "jump-1"
  },
  {
      "number": 288,
      "species": "Vigoroth",
      "jump": "jump-5"
  },
  {
      "number": 289,
      "species": "Slaking",
      "jump": "jump-4"
  },
  {
      "number": 290,
      "species": "Nincada",
      "jump": "jump-6"
  },
  {
      "number": 291,
      "species": "Ninjask",
      "jump": "jump-4"
  },
  {
      "number": 292,
      "species": "Shedinja",
      "jump": ""
  },
  {
      "number": 293,
      "species": "Whismur",
      "jump": "jump-4"
  },
  {
      "number": 294,
      "species": "Loudred",
      "jump": "jump-3"
  },
  {
      "number": 295,
      "species": "Exploud",
      "jump": "jump-2"
  },
  {
      "number": 296,
      "species": "Makuhita",
      "jump": "jump-2"
  },
  {
      "number": 297,
      "species": "Hariyama",
      "jump": "jump-2"
  },
  {
      "number": 298,
      "species": "Azurill",
      "jump": "jump-4"
  },
  {
      "number": 299,
      "species": "Nosepass",
      "jump": "jump-1"
  },
  {
      "number": 300,
      "species": "Skitty",
      "jump": "jump-5"
  },
  {
      "number": 301,
      "species": "Delcatty",
      "jump": "jump-5"
  },
  {
      "number": 302,
      "species": "Sableye",
      "jump": "jump-2"
  },
  {
      "number": 302,
      "species": "Sableye Mega",
      "jump": "jump-2"
  },
  {
      "number": 303,
      "species": "Mawile",
      "jump": "jump-2"
  },
  {
      "number": 303,
      "species": "Mawile Mega",
      "jump": "jump-3"
  },
  {
      "number": 304,
      "species": "Aron",
      "jump": "jump-2"
  },
  {
      "number": 305,
      "species": "Lairon",
      "jump": "jump-2"
  },
  {
      "number": 306,
      "species": "Aggron",
      "jump": "jump-1"
  },
  {
      "number": 306,
      "species": "Aggron Mega",
      "jump": "jump-1"
  },
  {
      "number": 307,
      "species": "Meditite",
      "jump": "jump-5"
  },
  {
      "number": 308,
      "species": "Medicham",
      "jump": "jump-4"
  },
  {
      "number": 308,
      "species": "Medicham Mega",
      "jump": "jump-5"
  },
  {
      "number": 309,
      "species": "Electrike",
      "jump": "jump-5"
  },
  {
      "number": 310,
      "species": "Manectric",
      "jump": "jump-4"
  },
  {
      "number": 310,
      "species": "Manectric Mega",
      "jump": "jump-4"
  },
  {
      "number": 311,
      "species": "Plusle",
      "jump": "jump-5"
  },
  {
      "number": 312,
      "species": "Minun",
      "jump": "jump-5"
  },
  {
      "number": 313,
      "species": "Volbeat",
      "jump": "jump-2"
  },
  {
      "number": 314,
      "species": "Illumise",
      "jump": "jump-2"
  },
  {
      "number": 315,
      "species": "Roselia",
      "jump": "jump-2"
  },
  {
      "number": 316,
      "species": "Gulpin",
      "jump": "jump-1"
  },
  {
      "number": 317,
      "species": "Swalot",
      "jump": "jump-1"
  },
  {
      "number": 318,
      "species": "Carvanha",
      "jump": "jump-3"
  },
  {
      "number": 319,
      "species": "Sharpedo",
      "jump": "jump-3"
  },
  {
      "number": 319,
      "species": "Sharpedo Mega",
      "jump": "jump-3"
  },
  {
      "number": 320,
      "species": "Wailmer",
      "jump": "jump-3"
  },
  {
      "number": 321,
      "species": "Wailord",
      "jump": "jump-3"
  },
  {
      "number": 322,
      "species": "Numel",
      "jump": "jump-3"
  },
  {
      "number": 323,
      "species": "Camerupt",
      "jump": "jump-2"
  },
  {
      "number": 323,
      "species": "Camerupt Mega",
      "jump": "jump-1"
  },
  {
      "number": 324,
      "species": "Torkoal",
      "jump": "jump-2"
  },
  {
      "number": 325,
      "species": "Spoink",
      "jump": "jump-7"
  },
  {
      "number": 326,
      "species": "Grumpig",
      "jump": "jump-4"
  },
  {
      "number": 327,
      "species": "Spinda",
      "jump": "jump-4"
  },
  {
      "number": 328,
      "species": "Trapinch",
      "jump": "jump-2"
  },
  {
      "number": 329,
      "species": "Vibrava",
      "jump": "jump-4"
  },
  {
      "number": 330,
      "species": "Flygon",
      "jump": "jump-3"
  },
  {
      "number": 331,
      "species": "Cacnea",
      "jump": "jump-2"
  },
  {
      "number": 332,
      "species": "Cacturne",
      "jump": "jump-2"
  },
  {
      "number": 333,
      "species": "Swablu",
      "jump": "jump-2"
  },
  {
      "number": 334,
      "species": "Altaria",
      "jump": "jump-2"
  },
  {
      "number": 334,
      "species": "Altaria Mega",
      "jump": "jump-2"
  },
  {
      "number": 335,
      "species": "Zangoose",
      "jump": "jump-5"
  },
  {
      "number": 336,
      "species": "Seviper",
      "jump": "jump-3"
  },
  {
      "number": 337,
      "species": "Lunatone",
      "jump": ""
  },
  {
      "number": 338,
      "species": "Solrock",
      "jump": ""
  },
  {
      "number": 339,
      "species": "Barboach",
      "jump": "jump-2"
  },
  {
      "number": 340,
      "species": "Whiscash",
      "jump": "jump-1"
  },
  {
      "number": 341,
      "species": "Corphish",
      "jump": "jump-2"
  },
  {
      "number": 342,
      "species": "Crawdaunt",
      "jump": "jump-2"
  },
  {
      "number": 343,
      "species": "Baltoy",
      "jump": "jump-5"
  },
  {
      "number": 344,
      "species": "Claydol",
      "jump": ""
  },
  {
      "number": 345,
      "species": "Lileep",
      "jump": "jump-1"
  },
  {
      "number": 346,
      "species": "Cradily",
      "jump": "jump-1"
  },
  {
      "number": 347,
      "species": "Anorith",
      "jump": "jump-3"
  },
  {
      "number": 348,
      "species": "Armaldo",
      "jump": "jump-2"
  },
  {
      "number": 349,
      "species": "Feebas",
      "jump": "jump-4"
  },
  {
      "number": 350,
      "species": "Milotic",
      "jump": "jump-2"
  },
  {
      "number": 351,
      "species": "Castform",
      "jump": "jump-3"
  },
  {
      "number": 351,
      "species": "Castform Rainy Form",
      "jump": "jump-3"
  },
  {
      "number": 351,
      "species": "Castform Snowy Form",
      "jump": "jump-3"
  },
  {
      "number": 351,
      "species": "Castform Sunny Form",
      "jump": "jump-3"
  },
  {
      "number": 352,
      "species": "Kecleon",
      "jump": "jump-6"
  },
  {
      "number": 353,
      "species": "Shuppet",
      "jump": ""
  },
  {
      "number": 354,
      "species": "Banette",
      "jump": "jump-2"
  },
  {
      "number": 354,
      "species": "Banette Mega",
      "jump": "jump-1"
  },
  {
      "number": 355,
      "species": "Duskull",
      "jump": ""
  },
  {
      "number": 356,
      "species": "Dusclops",
      "jump": "jump-2"
  },
  {
      "number": 357,
      "species": "Tropius",
      "jump": "jump-1"
  },
  {
      "number": 358,
      "species": "Chimecho",
      "jump": ""
  },
  {
      "number": 359,
      "species": "Absol",
      "jump": "jump-6"
  },
  {
      "number": 359,
      "species": "Absol Mega",
      "jump": "jump-6"
  },
  {
      "number": 360,
      "species": "Wynaut",
      "jump": "jump-3"
  },
  {
      "number": 361,
      "species": "Snorunt",
      "jump": "jump-5"
  },
  {
      "number": 362,
      "species": "Glalie",
      "jump": "jump-1"
  },
  {
      "number": 362,
      "species": "Glalie Mega",
      "jump": "jump-1"
  },
  {
      "number": 363,
      "species": "Spheal",
      "jump": "jump-4"
  },
  {
      "number": 364,
      "species": "Sealeo",
      "jump": "jump-2"
  },
  {
      "number": 365,
      "species": "Walrein",
      "jump": "jump-1"
  },
  {
      "number": 366,
      "species": "Clamperl",
      "jump": "jump-4"
  },
  {
      "number": 367,
      "species": "Huntail",
      "jump": "jump-2"
  },
  {
      "number": 368,
      "species": "Gorebyss",
      "jump": "jump-2"
  },
  {
      "number": 369,
      "species": "Relicanth",
      "jump": "jump-1"
  },
  {
      "number": 370,
      "species": "Luvdisc",
      "jump": "jump-1"
  },
  {
      "number": 371,
      "species": "Bagon",
      "jump": "jump-4"
  },
  {
      "number": 372,
      "species": "Shelgon",
      "jump": "jump-4"
  },
  {
      "number": 373,
      "species": "Salamence",
      "jump": "jump-2"
  },
  {
      "number": 373,
      "species": "Salamence Mega",
      "jump": "jump-1"
  },
  {
      "number": 374,
      "species": "Beldum",
      "jump": "jump-1"
  },
  {
      "number": 375,
      "species": "Metang",
      "jump": "jump-2"
  },
  {
      "number": 376,
      "species": "Metagross",
      "jump": "jump-2"
  },
  {
      "number": 376,
      "species": "Metagross Mega",
      "jump": ""
  },
  {
      "number": 377,
      "species": "Regirock",
      "jump": "jump-3"
  },
  {
      "number": 378,
      "species": "Regice",
      "jump": "jump-3"
  },
  {
      "number": 379,
      "species": "Registeel",
      "jump": "jump-3"
  },
  {
      "number": 380,
      "species": "Latias",
      "jump": ""
  },
  {
      "number": 380,
      "species": "Latias Mega",
      "jump": ""
  },
  {
      "number": 381,
      "species": "Latios",
      "jump": ""
  },
  {
      "number": 381,
      "species": "Latios Mega",
      "jump": ""
  },
  {
      "number": 382,
      "species": "Kyogre",
      "jump": "jump-1"
  },
  {
      "number": 382,
      "species": "Kyogre Primal",
      "jump": "jump-1"
  },
  {
      "number": 383,
      "species": "Groudon",
      "jump": "jump-1"
  },
  {
      "number": 383,
      "species": "Groudon Primal",
      "jump": "jump-1"
  },
  {
      "number": 384,
      "species": "Rayquaza",
      "jump": "jump-1"
  },
  {
      "number": 384,
      "species": "Rayquaza Mega",
      "jump": "jump-1"
  },
  {
      "number": 385,
      "species": "Jirachi",
      "jump": "jump-4"
  },
  {
      "number": 386,
      "species": "Deoxys Attack Forme",
      "jump": "jump-5"
  },
  {
      "number": 386,
      "species": "Deoxys Defense Forme",
      "jump": "jump-5"
  },
  {
      "number": 386,
      "species": "Deoxys Normal Forme",
      "jump": "jump-5"
  },
  {
      "number": 386,
      "species": "Deoxys Speed Forme",
      "jump": "jump-6"
  },
  {
      "number": 387,
      "species": "Turtwig",
      "jump": "jump-3"
  },
  {
      "number": 388,
      "species": "Grotle",
      "jump": "jump-2"
  },
  {
      "number": 389,
      "species": "Torterra",
      "jump": "jump-1"
  },
  {
      "number": 390,
      "species": "Chimchar",
      "jump": "jump-5"
  },
  {
      "number": 391,
      "species": "Monferno",
      "jump": "jump-4"
  },
  {
      "number": 392,
      "species": "Infernape",
      "jump": "jump-4"
  },
  {
      "number": 393,
      "species": "Piplup",
      "jump": "jump-4"
  },
  {
      "number": 394,
      "species": "Prinplup",
      "jump": "jump-3"
  },
  {
      "number": 395,
      "species": "Empoleon",
      "jump": "jump-2"
  },
  {
      "number": 396,
      "species": "Starly",
      "jump": "jump-3"
  },
  {
      "number": 397,
      "species": "Staravia",
      "jump": "jump-2"
  },
  {
      "number": 398,
      "species": "Staraptor",
      "jump": "jump-2"
  },
  {
      "number": 399,
      "species": "Bidoof",
      "jump": "jump-3"
  },
  {
      "number": 400,
      "species": "Bibarel",
      "jump": "jump-3"
  },
  {
      "number": 401,
      "species": "Kricketot",
      "jump": "jump-5"
  },
  {
      "number": 402,
      "species": "Kricketune",
      "jump": "jump-4"
  },
  {
      "number": 403,
      "species": "Shinx",
      "jump": "jump-5"
  },
  {
      "number": 404,
      "species": "Luxio",
      "jump": "jump-5"
  },
  {
      "number": 405,
      "species": "Luxray",
      "jump": "jump-5"
  },
  {
      "number": 406,
      "species": "Budew",
      "jump": "jump-3"
  },
  {
      "number": 407,
      "species": "Roserade",
      "jump": "jump-2"
  },
  {
      "number": 408,
      "species": "Cranidos",
      "jump": "jump-4"
  },
  {
      "number": 409,
      "species": "Rampardos",
      "jump": "jump-3"
  },
  {
      "number": 410,
      "species": "Shieldon",
      "jump": "jump-2"
  },
  {
      "number": 411,
      "species": "Bastiodon",
      "jump": "jump-1"
  },
  {
      "number": 412,
      "species": "Burmy Plant Cloak",
      "jump": "jump-1"
  },
  {
      "number": 412,
      "species": "Burmy Sandy Cloak",
      "jump": "jump-1"
  },
  {
      "number": 412,
      "species": "Burmy Trash Cloak",
      "jump": "jump-1"
  },
  {
      "number": 413,
      "species": "Wormadam Plant Cloak",
      "jump": "jump-1"
  },
  {
      "number": 413,
      "species": "Wormadam Sandy Cloak",
      "jump": "jump-1"
  },
  {
      "number": 413,
      "species": "Wormadam Trash Cloak",
      "jump": "jump-1"
  },
  {
      "number": 414,
      "species": "Mothim",
      "jump": "jump-2"
  },
  {
      "number": 415,
      "species": "Combee",
      "jump": "jump-1"
  },
  {
      "number": 416,
      "species": "Vespiquen",
      "jump": "jump-1"
  },
  {
      "number": 417,
      "species": "Pachirisu",
      "jump": "jump-6"
  },
  {
      "number": 418,
      "species": "Buizel",
      "jump": "jump-5"
  },
  {
      "number": 419,
      "species": "Floatzel",
      "jump": "jump-5"
  },
  {
      "number": 420,
      "species": "Cherubi",
      "jump": "jump-1"
  },
  {
      "number": 421,
      "species": "Cherrim Overcast Form",
      "jump": "jump-1"
  },
  {
      "number": 421,
      "species": "Cherrim Sunshine Form",
      "jump": "jump-1"
  },
  {
      "number": 422,
      "species": "Shellos",
      "jump": "jump-1"
  },
  {
      "number": 423,
      "species": "Gastrodon",
      "jump": "jump-1"
  },
  {
      "number": 424,
      "species": "Ambipom",
      "jump": "jump-5"
  },
  {
      "number": 425,
      "species": "Drifloon",
      "jump": ""
  },
  {
      "number": 426,
      "species": "Drifblim",
      "jump": ""
  },
  {
      "number": 427,
      "species": "Buneary",
      "jump": "jump-5"
  },
  {
      "number": 428,
      "species": "Lopunny",
      "jump": "jump-5"
  },
  {
      "number": 428,
      "species": "Lopunny Mega",
      "jump": "jump-6"
  },
  {
      "number": 429,
      "species": "Mismagius",
      "jump": ""
  },
  {
      "number": 430,
      "species": "Honchkrow",
      "jump": "jump-2"
  },
  {
      "number": 431,
      "species": "Glameow",
      "jump": "jump-6"
  },
  {
      "number": 432,
      "species": "Purugly",
      "jump": "jump-5"
  },
  {
      "number": 433,
      "species": "Chingling",
      "jump": "jump-2"
  },
  {
      "number": 434,
      "species": "Stunky",
      "jump": "jump-5"
  },
  {
      "number": 435,
      "species": "Skuntank",
      "jump": "jump-4"
  },
  {
      "number": 436,
      "species": "Bronzor",
      "jump": ""
  },
  {
      "number": 437,
      "species": "Bronzong",
      "jump": ""
  },
  {
      "number": 438,
      "species": "Bonsly",
      "jump": "jump-3"
  },
  {
      "number": 439,
      "species": "Mime Jr.",
      "jump": "jump-5"
  },
  {
      "number": 440,
      "species": "Happiny",
      "jump": "jump-3"
  },
  {
      "number": 441,
      "species": "Chatot",
      "jump": "jump-2"
  },
  {
      "number": 442,
      "species": "Spiritomb",
      "jump": "jump-2"
  },
  {
      "number": 443,
      "species": "Gible",
      "jump": "jump-5"
  },
  {
      "number": 444,
      "species": "Gabite",
      "jump": "jump-5"
  },
  {
      "number": 445,
      "species": "Garchomp",
      "jump": "jump-4"
  },
  {
      "number": 445,
      "species": "Garchomp Mega",
      "jump": "jump-3"
  },
  {
      "number": 446,
      "species": "Munchlax",
      "jump": "jump-2"
  },
  {
      "number": 447,
      "species": "Riolu",
      "jump": "jump-5"
  },
  {
      "number": 448,
      "species": "Lucario",
      "jump": "jump-4"
  },
  {
      "number": 448,
      "species": "Lucario Mega",
      "jump": "jump-4"
  },
  {
      "number": 449,
      "species": "Hippopotas",
      "jump": "jump-2"
  },
  {
      "number": 450,
      "species": "Hippowdon",
      "jump": "jump-1"
  },
  {
      "number": 451,
      "species": "Skorupi",
      "jump": "jump-3"
  },
  {
      "number": 452,
      "species": "Drapion",
      "jump": "jump-3"
  },
  {
      "number": 453,
      "species": "Croagunk",
      "jump": "jump-5"
  },
  {
      "number": 454,
      "species": "Toxicroak",
      "jump": "jump-5"
  },
  {
      "number": 455,
      "species": "Carnivine",
      "jump": ""
  },
  {
      "number": 456,
      "species": "Finneon",
      "jump": "jump-1"
  },
  {
      "number": 457,
      "species": "Lumineon",
      "jump": "jump-1"
  },
  {
      "number": 458,
      "species": "Mantyke",
      "jump": "jump-1"
  },
  {
      "number": 459,
      "species": "Snover",
      "jump": "jump-1"
  },
  {
      "number": 460,
      "species": "Abomasnow",
      "jump": "jump-2"
  },
  {
      "number": 460,
      "species": "Abomasnow Mega",
      "jump": "jump-1"
  },
  {
      "number": 461,
      "species": "Weavile",
      "jump": "jump-5"
  },
  {
      "number": 462,
      "species": "Magnezone",
      "jump": ""
  },
  {
      "number": 463,
      "species": "Lickilicky",
      "jump": "jump-2"
  },
  {
      "number": 464,
      "species": "Rhyperior",
      "jump": "jump-1"
  },
  {
      "number": 465,
      "species": "Tangrowth",
      "jump": "jump-2"
  },
  {
      "number": 466,
      "species": "Electivire",
      "jump": "jump-2"
  },
  {
      "number": 467,
      "species": "Magmortar",
      "jump": "jump-2"
  },
  {
      "number": 468,
      "species": "Togekiss",
      "jump": "jump-2"
  },
  {
      "number": 469,
      "species": "Yanmega",
      "jump": "jump-1"
  },
  {
      "number": 470,
      "species": "Leafeon",
      "jump": "jump-4"
  },
  {
      "number": 471,
      "species": "Glaceon",
      "jump": "jump-4"
  },
  {
      "number": 472,
      "species": "Gliscor",
      "jump": "jump-2"
  },
  {
      "number": 473,
      "species": "Mamoswine",
      "jump": "jump-2"
  },
  {
      "number": 474,
      "species": "Porygon-Z",
      "jump": ""
  },
  {
      "number": 475,
      "species": "Gallade",
      "jump": "jump-3"
  },
  {
      "number": 475,
      "species": "Gallade Mega",
      "jump": "jump-4"
  },
  {
      "number": 476,
      "species": "Probopass",
      "jump": ""
  },
  {
      "number": 477,
      "species": "Dusknoir",
      "jump": ""
  },
  {
      "number": 478,
      "species": "Froslass",
      "jump": ""
  },
  {
      "number": 479,
      "species": "Rotom",
      "jump": "jump-1"
  },
  {
      "number": 479,
      "species": "Rotom Fan",
      "jump": "jump-1"
  },
  {
      "number": 479,
      "species": "Rotom Frost",
      "jump": "jump-1"
  },
  {
      "number": 479,
      "species": "Rotom Heat",
      "jump": "jump-1"
  },
  {
      "number": 479,
      "species": "Rotom Mow",
      "jump": "jump-1"
  },
  {
      "number": 479,
      "species": "Rotom Wash",
      "jump": "jump-1"
  },
  {
      "number": 480,
      "species": "Uxie",
      "jump": "jump-4"
  },
  {
      "number": 481,
      "species": "Mesprit",
      "jump": "jump-4"
  },
  {
      "number": 482,
      "species": "Azelf",
      "jump": "jump-4"
  },
  {
      "number": 483,
      "species": "Dialga",
      "jump": "jump-2"
  },
  {
      "number": 483,
      "species": "Dialga Origin Forme",
      "jump": "jump-1"
  },
  {
      "number": 484,
      "species": "Palkia",
      "jump": "jump-2"
  },
  {
      "number": 484,
      "species": "Palkia Origin Forme",
      "jump": "jump-1"
  },
  {
      "number": 485,
      "species": "Heatran",
      "jump": "jump-2"
  },
  {
      "number": 486,
      "species": "Regigigas",
      "jump": "jump-3"
  },
  {
      "number": 487,
      "species": "Giratina Altered Forme",
      "jump": "jump-2"
  },
  {
      "number": 487,
      "species": "Giratina Origin Forme",
      "jump": ""
  },
  {
      "number": 488,
      "species": "Cresselia",
      "jump": ""
  },
  {
      "number": 489,
      "species": "Phione",
      "jump": "jump-3"
  },
  {
      "number": 490,
      "species": "Manaphy",
      "jump": "jump-4"
  },
  {
      "number": 491,
      "species": "Darkrai",
      "jump": ""
  },
  {
      "number": 492,
      "species": "Shaymin Land Forme",
      "jump": "jump-4"
  },
  {
      "number": 492,
      "species": "Shaymin Sky Forme",
      "jump": "jump-4"
  },
  {
      "number": 493,
      "species": "Arceus",
      "jump": "jump-6"
  },
  {
      "number": 494,
      "species": "Victini",
      "jump": "jump-4"
  },
  {
      "number": 495,
      "species": "Snivy",
      "jump": "jump-4"
  },
  {
      "number": 496,
      "species": "Servine",
      "jump": "jump-3"
  },
  {
      "number": 497,
      "species": "Serperior",
      "jump": "jump-2"
  },
  {
      "number": 498,
      "species": "Tepig",
      "jump": "jump-4"
  },
  {
      "number": 499,
      "species": "Pignite",
      "jump": "jump-3"
  },
  {
      "number": 500,
      "species": "Emboar",
      "jump": "jump-2"
  },
  {
      "number": 501,
      "species": "Oshawott",
      "jump": "jump-4"
  },
  {
      "number": 502,
      "species": "Dewott",
      "jump": "jump-3"
  },
  {
      "number": 503,
      "species": "Samurott",
      "jump": "jump-3"
  },
  {
      "number": 503,
      "species": "Samurott Hisuian",
      "jump": "jump-3"
  },
  {
      "number": 504,
      "species": "Patrat",
      "jump": "jump-5"
  },
  {
      "number": 505,
      "species": "Watchog",
      "jump": "jump-4"
  },
  {
      "number": 506,
      "species": "Lillipup",
      "jump": "jump-5"
  },
  {
      "number": 507,
      "species": "Herdier",
      "jump": "jump-4"
  },
  {
      "number": 508,
      "species": "Stoutland",
      "jump": "jump-4"
  },
  {
      "number": 509,
      "species": "Purrloin",
      "jump": "jump-6"
  },
  {
      "number": 510,
      "species": "Liepard",
      "jump": "jump-6"
  },
  {
      "number": 511,
      "species": "Pansage",
      "jump": "jump-6"
  },
  {
      "number": 512,
      "species": "Simisage",
      "jump": "jump-5"
  },
  {
      "number": 513,
      "species": "Pansear",
      "jump": "jump-6"
  },
  {
      "number": 514,
      "species": "Simisear",
      "jump": "jump-5"
  },
  {
      "number": 515,
      "species": "Panpour",
      "jump": "jump-6"
  },
  {
      "number": 516,
      "species": "Simipour",
      "jump": "jump-5"
  },
  {
      "number": 517,
      "species": "Munna",
      "jump": ""
  },
  {
      "number": 518,
      "species": "Musharna",
      "jump": ""
  },
  {
      "number": 519,
      "species": "Pidove",
      "jump": "jump-4"
  },
  {
      "number": 520,
      "species": "Tranquill",
      "jump": "jump-4"
  },
  {
      "number": 521,
      "species": "Unfezant",
      "jump": "jump-4"
  },
  {
      "number": 522,
      "species": "Blitzle",
      "jump": "jump-5"
  },
  {
      "number": 523,
      "species": "Zebstrika",
      "jump": "jump-5"
  },
  {
      "number": 524,
      "species": "Roggenrola",
      "jump": "jump-2"
  },
  {
      "number": 525,
      "species": "Boldore",
      "jump": "jump-1"
  },
  {
      "number": 526,
      "species": "Gigalith",
      "jump": "jump-1"
  },
  {
      "number": 527,
      "species": "Woobat",
      "jump": "jump-1"
  },
  {
      "number": 528,
      "species": "Swoobat",
      "jump": "jump-2"
  },
  {
      "number": 529,
      "species": "Drilbur",
      "jump": "jump-4"
  },
  {
      "number": 530,
      "species": "Excadrill",
      "jump": "jump-4"
  },
  {
      "number": 531,
      "species": "Audino",
      "jump": "jump-2"
  },
  {
      "number": 531,
      "species": "Audino Mega",
      "jump": "jump-2"
  },
  {
      "number": 532,
      "species": "Timburr",
      "jump": "jump-3"
  },
  {
      "number": 533,
      "species": "Gurdurr",
      "jump": "jump-2"
  },
  {
      "number": 534,
      "species": "Conkeldurr",
      "jump": "jump-2"
  },
  {
      "number": 535,
      "species": "Tympole",
      "jump": "jump-3"
  },
  {
      "number": 536,
      "species": "Palpitoad",
      "jump": "jump-3"
  },
  {
      "number": 537,
      "species": "Seismitoad",
      "jump": "jump-4"
  },
  {
      "number": 538,
      "species": "Throh",
      "jump": "jump-3"
  },
  {
      "number": 539,
      "species": "Sawk",
      "jump": "jump-3"
  },
  {
      "number": 540,
      "species": "Sewaddle",
      "jump": "jump-2"
  },
  {
      "number": 541,
      "species": "Swadloon",
      "jump": "jump-4"
  },
  {
      "number": 542,
      "species": "Leavanny",
      "jump": "jump-5"
  },
  {
      "number": 543,
      "species": "Venipede",
      "jump": "jump-5"
  },
  {
      "number": 544,
      "species": "Whirlipede",
      "jump": "jump-4"
  },
  {
      "number": 545,
      "species": "Scolipede",
      "jump": "jump-5"
  },
  {
      "number": 546,
      "species": "Cottonee",
      "jump": "jump-2"
  },
  {
      "number": 547,
      "species": "Whimsicott",
      "jump": "jump-2"
  },
  {
      "number": 548,
      "species": "Petilil",
      "jump": "jump-2"
  },
  {
      "number": 549,
      "species": "Lilligant",
      "jump": "jump-3"
  },
  {
      "number": 549,
      "species": "Lilligant Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 550,
      "species": "Basculin",
      "jump": "jump-3"
  },
  {
      "number": 551,
      "species": "Sandile",
      "jump": "jump-3"
  },
  {
      "number": 552,
      "species": "Krokorok",
      "jump": "jump-3"
  },
  {
      "number": 553,
      "species": "Krookodile",
      "jump": "jump-2"
  },
  {
      "number": 554,
      "species": "Darumaka",
      "jump": "jump-5"
  },
  {
      "number": 554,
      "species": "Darumaka Galarian",
      "jump": "jump-5"
  },
  {
      "number": 555,
      "species": "Darmanitan Galarian Standard Mode",
      "jump": "jump-4"
  },
  {
      "number": 555,
      "species": "Darmanitan Galarian Zen Mode",
      "jump": "jump-2"
  },
  {
      "number": 555,
      "species": "Darmanitan Standard Mode",
      "jump": "jump-3"
  },
  {
      "number": 555,
      "species": "Darmanitan Zen Mode",
      "jump": "jump-1"
  },
  {
      "number": 556,
      "species": "Maractus",
      "jump": "jump-1"
  },
  {
      "number": 557,
      "species": "Dwebble",
      "jump": "jump-1"
  },
  {
      "number": 558,
      "species": "Crustle",
      "jump": "jump-1"
  },
  {
      "number": 559,
      "species": "Scraggy",
      "jump": "jump-4"
  },
  {
      "number": 560,
      "species": "Scrafty",
      "jump": "jump-4"
  },
  {
      "number": 561,
      "species": "Sigilyph",
      "jump": "jump-1"
  },
  {
      "number": 562,
      "species": "Yamask",
      "jump": ""
  },
  {
      "number": 562,
      "species": "Yamask Galarian",
      "jump": ""
  },
  {
      "number": 563,
      "species": "Cofagrigus",
      "jump": "jump-1"
  },
  {
      "number": 564,
      "species": "Tirtouga",
      "jump": "jump-2"
  },
  {
      "number": 565,
      "species": "Carracosta",
      "jump": "jump-1"
  },
  {
      "number": 566,
      "species": "Archen",
      "jump": "jump-4"
  },
  {
      "number": 567,
      "species": "Archeops",
      "jump": "jump-3"
  },
  {
      "number": 568,
      "species": "Trubbish",
      "jump": "jump-3"
  },
  {
      "number": 569,
      "species": "Garbodor",
      "jump": "jump-1"
  },
  {
      "number": 570,
      "species": "Zorua",
      "jump": "jump-5"
  },
  {
      "number": 570,
      "species": "Zorua Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 571,
      "species": "Zoroark",
      "jump": "jump-5"
  },
  {
      "number": 571,
      "species": "Zoroark Hisuian",
      "jump": "jump-5"
  },
  {
      "number": 572,
      "species": "Minccino",
      "jump": "jump-5"
  },
  {
      "number": 573,
      "species": "Cinccino",
      "jump": "jump-5"
  },
  {
      "number": 574,
      "species": "Gothita",
      "jump": "jump-4"
  },
  {
      "number": 575,
      "species": "Gothorita",
      "jump": "jump-3"
  },
  {
      "number": 576,
      "species": "Gothitelle",
      "jump": "jump-3"
  },
  {
      "number": 577,
      "species": "Solosis",
      "jump": ""
  },
  {
      "number": 578,
      "species": "Duosion",
      "jump": ""
  },
  {
      "number": 579,
      "species": "Reuniclus",
      "jump": ""
  },
  {
      "number": 580,
      "species": "Ducklett",
      "jump": "jump-2"
  },
  {
      "number": 581,
      "species": "Swanna",
      "jump": "jump-2"
  },
  {
      "number": 582,
      "species": "Vanillite",
      "jump": ""
  },
  {
      "number": 583,
      "species": "Vanillish",
      "jump": ""
  },
  {
      "number": 584,
      "species": "Vanilluxe",
      "jump": ""
  },
  {
      "number": 585,
      "species": "Deerling",
      "jump": "jump-5"
  },
  {
      "number": 586,
      "species": "Sawsbuck",
      "jump": "jump-4"
  },
  {
      "number": 587,
      "species": "Emolga",
      "jump": "jump-4"
  },
  {
      "number": 588,
      "species": "Karrablast",
      "jump": "jump-5"
  },
  {
      "number": 589,
      "species": "Escavalier",
      "jump": "jump-1"
  },
  {
      "number": 590,
      "species": "Foongus",
      "jump": "jump-3"
  },
  {
      "number": 591,
      "species": "Amoonguss",
      "jump": "jump-2"
  },
  {
      "number": 592,
      "species": "Frillish",
      "jump": "jump-2"
  },
  {
      "number": 593,
      "species": "Jellicent",
      "jump": "jump-1"
  },
  {
      "number": 594,
      "species": "Alomomola",
      "jump": "jump-1"
  },
  {
      "number": 595,
      "species": "Joltik",
      "jump": "jump-8"
  },
  {
      "number": 596,
      "species": "Galvantula",
      "jump": "jump-7"
  },
  {
      "number": 597,
      "species": "Ferroseed",
      "jump": "jump-6"
  },
  {
      "number": 598,
      "species": "Ferrothorn",
      "jump": "jump-4"
  },
  {
      "number": 599,
      "species": "Klink",
      "jump": ""
  },
  {
      "number": 600,
      "species": "Klang",
      "jump": ""
  },
  {
      "number": 601,
      "species": "Klinklang",
      "jump": ""
  },
  {
      "number": 602,
      "species": "Tynamo",
      "jump": "jump-1"
  },
  {
      "number": 603,
      "species": "Eelektrik",
      "jump": "jump-2"
  },
  {
      "number": 604,
      "species": "Eelektross",
      "jump": "jump-3"
  },
  {
      "number": 605,
      "species": "Elgyem",
      "jump": "jump-3"
  },
  {
      "number": 606,
      "species": "Beheeyem",
      "jump": "jump-1"
  },
  {
      "number": 607,
      "species": "Litwick",
      "jump": "jump-1"
  },
  {
      "number": 608,
      "species": "Lampent",
      "jump": ""
  },
  {
      "number": 609,
      "species": "Chandelure",
      "jump": ""
  },
  {
      "number": 610,
      "species": "Axew",
      "jump": "jump-5"
  },
  {
      "number": 611,
      "species": "Fraxure",
      "jump": "jump-4"
  },
  {
      "number": 612,
      "species": "Haxorus",
      "jump": "jump-4"
  },
  {
      "number": 613,
      "species": "Cubchoo",
      "jump": "jump-4"
  },
  {
      "number": 614,
      "species": "Beartic",
      "jump": "jump-2"
  },
  {
      "number": 615,
      "species": "Cryogonal",
      "jump": ""
  },
  {
      "number": 616,
      "species": "Shelmet",
      "jump": "jump-2"
  },
  {
      "number": 617,
      "species": "Accelgor",
      "jump": "jump-7"
  },
  {
      "number": 618,
      "species": "Stunfisk",
      "jump": "jump-3"
  },
  {
      "number": 618,
      "species": "Stunfisk Galarian",
      "jump": "jump-3"
  },
  {
      "number": 619,
      "species": "Mienfoo",
      "jump": "jump-5"
  },
  {
      "number": 620,
      "species": "Mienshao",
      "jump": "jump-5"
  },
  {
      "number": 621,
      "species": "Druddigon",
      "jump": "jump-3"
  },
  {
      "number": 622,
      "species": "Golett",
      "jump": "jump-2"
  },
  {
      "number": 623,
      "species": "Golurk",
      "jump": "jump-1"
  },
  {
      "number": 624,
      "species": "Pawniard",
      "jump": "jump-4"
  },
  {
      "number": 625,
      "species": "Bisharp",
      "jump": "jump-3"
  },
  {
      "number": 626,
      "species": "Bouffalant",
      "jump": "jump-2"
  },
  {
      "number": 627,
      "species": "Rufflet",
      "jump": "jump-4"
  },
  {
      "number": 628,
      "species": "Braviary",
      "jump": "jump-3"
  },
  {
      "number": 628,
      "species": "Braviary Hisuian",
      "jump": "jump-3"
  },
  {
      "number": 629,
      "species": "Vullaby",
      "jump": "jump-4"
  },
  {
      "number": 630,
      "species": "Mandibuzz",
      "jump": "jump-3"
  },
  {
      "number": 631,
      "species": "Heatmor",
      "jump": "jump-2"
  },
  {
      "number": 632,
      "species": "Durant",
      "jump": "jump-3"
  },
  {
      "number": 633,
      "species": "Deino",
      "jump": "jump-3"
  },
  {
      "number": 634,
      "species": "Zweilous",
      "jump": "jump-2"
  },
  {
      "number": 635,
      "species": "Hydreigon",
      "jump": "jump-1"
  },
  {
      "number": 636,
      "species": "Larvesta",
      "jump": "jump-3"
  },
  {
      "number": 637,
      "species": "Volcarona",
      "jump": "jump-1"
  },
  {
      "number": 638,
      "species": "Cobalion",
      "jump": "jump-5"
  },
  {
      "number": 639,
      "species": "Terrakion",
      "jump": "jump-5"
  },
  {
      "number": 640,
      "species": "Virizion",
      "jump": "jump-5"
  },
  {
      "number": 641,
      "species": "Tornadus Incarnate Forme",
      "jump": "jump-1"
  },
  {
      "number": 641,
      "species": "Tornadus Therian Forme",
      "jump": "jump-3"
  },
  {
      "number": 642,
      "species": "Thundurus Incarnate Forme",
      "jump": "jump-1"
  },
  {
      "number": 642,
      "species": "Thundurus Therian Forme",
      "jump": "jump-2"
  },
  {
      "number": 643,
      "species": "Reshiram",
      "jump": "jump-2"
  },
  {
      "number": 644,
      "species": "Zekrom",
      "jump": "jump-2"
  },
  {
      "number": 645,
      "species": "Landorus Incarnate Forme",
      "jump": "jump-1"
  },
  {
      "number": 645,
      "species": "Landorus Therian Forme",
      "jump": "jump-3"
  },
  {
      "number": 646,
      "species": "Kyurem",
      "jump": "jump-1"
  },
  {
      "number": 646,
      "species": "Kyurem Black",
      "jump": "jump-2"
  },
  {
      "number": 646,
      "species": "Kyurem White",
      "jump": "jump-2"
  },
  {
      "number": 647,
      "species": "Keldeo Ordinary Form",
      "jump": "jump-5"
  },
  {
      "number": 647,
      "species": "Keldeo Resolute Form",
      "jump": "jump-5"
  },
  {
      "number": 648,
      "species": "Meloetta Aria Forme",
      "jump": "jump-3"
  },
  {
      "number": 648,
      "species": "Meloetta Pirouette Forme",
      "jump": "jump-5"
  },
  {
      "number": 649,
      "species": "Genesect",
      "jump": "jump-5"
  },
  {
      "number": 650,
      "species": "Chespin",
      "jump": "jump-4"
  },
  {
      "number": 651,
      "species": "Quilladin",
      "jump": "jump-2"
  },
  {
      "number": 652,
      "species": "Chesnaught",
      "jump": "jump-1"
  },
  {
      "number": 653,
      "species": "Fennekin",
      "jump": "jump-5"
  },
  {
      "number": 654,
      "species": "Braixen",
      "jump": "jump-3"
  },
  {
      "number": 655,
      "species": "Delphox",
      "jump": "jump-2"
  },
  {
      "number": 656,
      "species": "Froakie",
      "jump": "jump-5"
  },
  {
      "number": 657,
      "species": "Frogadier",
      "jump": "jump-5"
  },
  {
      "number": 658,
      "species": "Greninja",
      "jump": "jump-6"
  },
  {
      "number": 659,
      "species": "Bunnelby",
      "jump": "jump-4"
  },
  {
      "number": 660,
      "species": "Diggersby",
      "jump": "jump-4"
  },
  {
      "number": 661,
      "species": "Fletchling",
      "jump": "jump-3"
  },
  {
      "number": 662,
      "species": "Fletchinder",
      "jump": "jump-3"
  },
  {
      "number": 663,
      "species": "Talonflame",
      "jump": "jump-2"
  },
  {
      "number": 664,
      "species": "Scatterbug",
      "jump": "jump-2"
  },
  {
      "number": 665,
      "species": "Spewpa",
      "jump": "jump-4"
  },
  {
      "number": 666,
      "species": "Vivillon",
      "jump": "jump-2"
  },
  {
      "number": 667,
      "species": "Litleo",
      "jump": "jump-5"
  },
  {
      "number": 668,
      "species": "Pyroar",
      "jump": "jump-4"
  },
  {
      "number": 669,
      "species": "Flabébé",
      "jump": "jump-2"
  },
  {
      "number": 670,
      "species": "Floette",
      "jump": "jump-2"
  },
  {
      "number": 670,
      "species": "Floette Eternal",
      "jump": "jump-2"
  },
  {
      "number": 671,
      "species": "Florges",
      "jump": "jump-2"
  },
  {
      "number": 672,
      "species": "Skiddo",
      "jump": "jump-5"
  },
  {
      "number": 673,
      "species": "Gogoat",
      "jump": "jump-4"
  },
  {
      "number": 674,
      "species": "Pancham",
      "jump": "jump-3"
  },
  {
      "number": 675,
      "species": "Pangoro",
      "jump": "jump-2"
  },
  {
      "number": 676,
      "species": "Furfrou",
      "jump": "jump-4"
  },
  {
      "number": 677,
      "species": "Espurr",
      "jump": "jump-3"
  },
  {
      "number": 678,
      "species": "Meowstic Female",
      "jump": "jump-3"
  },
  {
      "number": 678,
      "species": "Meowstic Male",
      "jump": "jump-3"
  },
  {
      "number": 679,
      "species": "Honedge",
      "jump": ""
  },
  {
      "number": 680,
      "species": "Doublade",
      "jump": ""
  },
  {
      "number": 681,
      "species": "Aegislash Blade Forme",
      "jump": ""
  },
  {
      "number": 681,
      "species": "Aegislash Shield Forme",
      "jump": ""
  },
  {
      "number": 682,
      "species": "Spritzee",
      "jump": "jump-2"
  },
  {
      "number": 683,
      "species": "Aromatisse",
      "jump": "jump-2"
  },
  {
      "number": 684,
      "species": "Swirlix",
      "jump": "jump-2"
  },
  {
      "number": 685,
      "species": "Slurpuff",
      "jump": "jump-2"
  },
  {
      "number": 686,
      "species": "Inkay",
      "jump": "jump-3"
  },
  {
      "number": 687,
      "species": "Malamar",
      "jump": "jump-3"
  },
  {
      "number": 688,
      "species": "Binacle",
      "jump": ""
  },
  {
      "number": 689,
      "species": "Barbaracle",
      "jump": "jump-2"
  },
  {
      "number": 690,
      "species": "Skrelp",
      "jump": "jump-1"
  },
  {
      "number": 691,
      "species": "Dragalge",
      "jump": "jump-1"
  },
  {
      "number": 692,
      "species": "Clauncher",
      "jump": "jump-2"
  },
  {
      "number": 693,
      "species": "Clawitzer",
      "jump": "jump-1"
  },
  {
      "number": 694,
      "species": "Helioptile",
      "jump": "jump-4"
  },
  {
      "number": 695,
      "species": "Heliolisk",
      "jump": "jump-3"
  },
  {
      "number": 696,
      "species": "Tyrunt",
      "jump": "jump-3"
  },
  {
      "number": 697,
      "species": "Tyrantrum",
      "jump": "jump-1"
  },
  {
      "number": 698,
      "species": "Amaura",
      "jump": "jump-2"
  },
  {
      "number": 699,
      "species": "Aurorus",
      "jump": "jump-1"
  },
  {
      "number": 700,
      "species": "Sylveon",
      "jump": "jump-4"
  },
  {
      "number": 701,
      "species": "Hawlucha",
      "jump": "jump-5"
  },
  {
      "number": 702,
      "species": "Dedenne",
      "jump": "jump-5"
  },
  {
      "number": 703,
      "species": "Carbink",
      "jump": ""
  },
  {
      "number": 704,
      "species": "Goomy",
      "jump": "jump-1"
  },
  {
      "number": 705,
      "species": "Sliggoo",
      "jump": "jump-1"
  },
  {
      "number": 705,
      "species": "Sliggoo Hisuian",
      "jump": "jump-1"
  },
  {
      "number": 706,
      "species": "Goodra",
      "jump": "jump-2"
  },
  {
      "number": 706,
      "species": "Goodra Hisuian",
      "jump": "jump-2"
  },
  {
      "number": 707,
      "species": "Klefki",
      "jump": ""
  },
  {
      "number": 708,
      "species": "Phantump",
      "jump": "jump-4"
  },
  {
      "number": 709,
      "species": "Trevenant",
      "jump": "jump-2"
  },
  {
      "number": 710,
      "species": "Pumpkaboo",
      "jump": "jump-4"
  },
  {
      "number": 711,
      "species": "Gourgeist",
      "jump": "jump-2"
  },
  {
      "number": 712,
      "species": "Bergmite",
      "jump": "jump-2"
  },
  {
      "number": 713,
      "species": "Avalugg",
      "jump": "jump-1"
  },
  {
      "number": 713,
      "species": "Avalugg Hisuian",
      "jump": "jump-1"
  },
  {
      "number": 714,
      "species": "Noibat",
      "jump": "jump-3"
  },
  {
      "number": 715,
      "species": "Noivern",
      "jump": "jump-3"
  },
  {
      "number": 716,
      "species": "Xerneas",
      "jump": "jump-4"
  },
  {
      "number": 717,
      "species": "Yveltal",
      "jump": "jump-3"
  },
  {
      "number": 718,
      "species": "Zygarde 10% Forme",
      "jump": "jump-5"
  },
  {
      "number": 718,
      "species": "Zygarde 50% Forme",
      "jump": "jump-2"
  },
  {
      "number": 718,
      "species": "Zygarde Complete Forme",
      "jump": "jump-2"
  },
  {
      "number": 719,
      "species": "Diancie",
      "jump": "jump-1"
  },
  {
      "number": 719,
      "species": "Diancie Mega",
      "jump": "jump-1"
  },
  {
      "number": 720,
      "species": "Hoopa Confined",
      "jump": "jump-2"
  },
  {
      "number": 720,
      "species": "Hoopa Unbound",
      "jump": "jump-3"
  },
  {
      "number": 721,
      "species": "Volcanion",
      "jump": "jump-1"
  },
  {
      "number": 722,
      "species": "Rowlet",
      "jump": "jump-3"
  },
  {
      "number": 723,
      "species": "Dartrix",
      "jump": "jump-3"
  },
  {
      "number": 724,
      "species": "Decidueye",
      "jump": "jump-2"
  },
  {
      "number": 724,
      "species": "Decidueye Hisuian",
      "jump": "jump-3"
  },
  {
      "number": 725,
      "species": "Litten",
      "jump": "jump-5"
  },
  {
      "number": 726,
      "species": "Torracat",
      "jump": "jump-5"
  },
  {
      "number": 727,
      "species": "Incineroar",
      "jump": "jump-4"
  },
  {
      "number": 728,
      "species": "Popplio",
      "jump": "jump-3"
  },
  {
      "number": 729,
      "species": "Brionne",
      "jump": "jump-2"
  },
  {
      "number": 730,
      "species": "Primarina",
      "jump": "jump-1"
  },
  {
      "number": 731,
      "species": "Pikipek",
      "jump": "jump-3"
  },
  {
      "number": 732,
      "species": "Trumbeak",
      "jump": "jump-3"
  },
  {
      "number": 733,
      "species": "Toucannon",
      "jump": "jump-2"
  },
  {
      "number": 734,
      "species": "Yungoos",
      "jump": "jump-4"
  },
  {
      "number": 735,
      "species": "Gumshoos",
      "jump": "jump-4"
  },
  {
      "number": 736,
      "species": "Grubbin",
      "jump": "jump-4"
  },
  {
      "number": 737,
      "species": "Charjabug",
      "jump": "jump-2"
  },
  {
      "number": 738,
      "species": "Vikavolt",
      "jump": "jump-2"
  },
  {
      "number": 739,
      "species": "Crabrawler",
      "jump": "jump-4"
  },
  {
      "number": 740,
      "species": "Crabominable",
      "jump": "jump-3"
  },
  {
      "number": 741,
      "species": "Oricorio Baile Style",
      "jump": "jump-3"
  },
  {
      "number": 741,
      "species": "Oricorio Pa'u Style",
      "jump": "jump-3"
  },
  {
      "number": 741,
      "species": "Oricorio Pom-Pom Style",
      "jump": "jump-3"
  },
  {
      "number": 741,
      "species": "Oricorio Sensu Style",
      "jump": "jump-3"
  },
  {
      "number": 742,
      "species": "Cutiefly",
      "jump": "jump-3"
  },
  {
      "number": 743,
      "species": "Ribombee",
      "jump": "jump-3"
  },
  {
      "number": 744,
      "species": "Rockruff",
      "jump": "jump-5"
  },
  {
      "number": 745,
      "species": "Lycanroc Dusk Form",
      "jump": "jump-5"
  },
  {
      "number": 745,
      "species": "Lycanroc Midday Form",
      "jump": "jump-5"
  },
  {
      "number": 745,
      "species": "Lycanroc Midnight Form",
      "jump": "jump-4"
  },
  {
      "number": 746,
      "species": "Wishiwashi School Form",
      "jump": "jump-4"
  },
  {
      "number": 746,
      "species": "Wishiwashi Solo Form",
      "jump": "jump-1"
  },
  {
      "number": 747,
      "species": "Mareanie",
      "jump": "jump-1"
  },
  {
      "number": 748,
      "species": "Toxapex",
      "jump": "jump-1"
  },
  {
      "number": 749,
      "species": "Mudbray",
      "jump": "jump-4"
  },
  {
      "number": 750,
      "species": "Mudsdale",
      "jump": "jump-2"
  },
  {
      "number": 751,
      "species": "Dewpider",
      "jump": "jump-4"
  },
  {
      "number": 752,
      "species": "Araquanid",
      "jump": "jump-4"
  },
  {
      "number": 753,
      "species": "Fomantis",
      "jump": "jump-4"
  },
  {
      "number": 754,
      "species": "Lurantis",
      "jump": "jump-3"
  },
  {
      "number": 755,
      "species": "Morelull",
      "jump": ""
  },
  {
      "number": 756,
      "species": "Shiinotic",
      "jump": "jump-1"
  },
  {
      "number": 757,
      "species": "Salandit",
      "jump": "jump-5"
  },
  {
      "number": 758,
      "species": "Salazzle",
      "jump": "jump-4"
  },
  {
      "number": 759,
      "species": "Stufful",
      "jump": "jump-3"
  },
  {
      "number": 760,
      "species": "Bewear",
      "jump": "jump-1"
  },
  {
      "number": 761,
      "species": "Bounsweet",
      "jump": "jump-4"
  },
  {
      "number": 762,
      "species": "Steenee",
      "jump": "jump-4"
  },
  {
      "number": 763,
      "species": "Tsareena",
      "jump": "jump-4"
  },
  {
      "number": 764,
      "species": "Comfey",
      "jump": "jump-1"
  },
  {
      "number": 765,
      "species": "Oranguru",
      "jump": "jump-3"
  },
  {
      "number": 766,
      "species": "Passimian",
      "jump": "jump-4"
  },
  {
      "number": 767,
      "species": "Wimpod",
      "jump": "jump-4"
  },
  {
      "number": 768,
      "species": "Golisopod",
      "jump": "jump-4"
  },
  {
      "number": 769,
      "species": "Sandygast",
      "jump": ""
  },
  {
      "number": 770,
      "species": "Palossand",
      "jump": ""
  },
  {
      "number": 771,
      "species": "Pyukumuku",
      "jump": "jump-4"
  },
  {
      "number": 772,
      "species": "Type: Null",
      "jump": "jump-4"
  },
  {
      "number": 773,
      "species": "Silvally",
      "jump": "jump-5"
  },
  {
      "number": 774,
      "species": "Minior Core",
      "jump": ""
  },
  {
      "number": 774,
      "species": "Minior Meteor",
      "jump": ""
  },
  {
      "number": 775,
      "species": "Komala",
      "jump": "jump-2"
  },
  {
      "number": 776,
      "species": "Turtonator",
      "jump": "jump-1"
  },
  {
      "number": 777,
      "species": "Togedemaru",
      "jump": "jump-4"
  },
  {
      "number": 778,
      "species": "Mimikyu",
      "jump": "jump-3"
  },
  {
      "number": 779,
      "species": "Bruxish",
      "jump": "jump-2"
  },
  {
      "number": 780,
      "species": "Drampa",
      "jump": "jump-1"
  },
  {
      "number": 781,
      "species": "Dhelmise",
      "jump": ""
  },
  {
      "number": 782,
      "species": "Jangmo-o",
      "jump": "jump-4"
  },
  {
      "number": 783,
      "species": "Hakamo-o",
      "jump": "jump-3"
  },
  {
      "number": 784,
      "species": "Kommo-o",
      "jump": "jump-2"
  },
  {
      "number": 785,
      "species": "Tapu Koko",
      "jump": "jump-2"
  },
  {
      "number": 786,
      "species": "Tapu Lele",
      "jump": "jump-2"
  },
  {
      "number": 787,
      "species": "Tapu Bulu",
      "jump": "jump-3"
  },
  {
      "number": 788,
      "species": "Tapu Fini",
      "jump": "jump-2"
  },
  {
      "number": 789,
      "species": "Cosmog",
      "jump": "jump-4"
  },
  {
      "number": 790,
      "species": "Cosmoem",
      "jump": "jump-1"
  },
  {
      "number": 791,
      "species": "Solgaleo",
      "jump": "jump-5"
  },
  {
      "number": 792,
      "species": "Lunala",
      "jump": "jump-1"
  },
  {
      "number": 793,
      "species": "Nihilego",
      "jump": "jump-1"
  },
  {
      "number": 794,
      "species": "Buzzwole",
      "jump": "jump-4"
  },
  {
      "number": 795,
      "species": "Pheromosa",
      "jump": "jump-5"
  },
  {
      "number": 796,
      "species": "Xurkitree",
      "jump": "jump-3"
  },
  {
      "number": 797,
      "species": "Celesteela",
      "jump": "jump-1"
  },
  {
      "number": 798,
      "species": "Kartana",
      "jump": "jump-2"
  },
  {
      "number": 799,
      "species": "Guzzlord",
      "jump": "jump-1"
  },
  {
      "number": 800,
      "species": "Necrozma",
      "jump": "jump-1"
  },
  {
      "number": 800,
      "species": "Necrozma Dawn Wings",
      "jump": "jump-1"
  },
  {
      "number": 800,
      "species": "Necrozma Dusk Mane",
      "jump": "jump-5"
  },
  {
      "number": 800,
      "species": "Necrozma Ultra",
      "jump": "jump-2"
  },
  {
      "number": 801,
      "species": "Magearna",
      "jump": "jump-1"
  },
  {
      "number": 802,
      "species": "Marshadow",
      "jump": "jump-5"
  },
  {
      "number": 803,
      "species": "Poipole",
      "jump": "jump-2"
  },
  {
      "number": 804,
      "species": "Naganadel",
      "jump": "jump-1"
  },
  {
      "number": 805,
      "species": "Stakataka",
      "jump": "jump-1"
  },
  {
      "number": 806,
      "species": "Blacephalon",
      "jump": "jump-4"
  },
  {
      "number": 807,
      "species": "Zeraora",
      "jump": "jump-5"
  },
  {
      "number": 808,
      "species": "Meltan",
      "jump": "jump-3"
  },
  {
      "number": 809,
      "species": "Melmetal",
      "jump": "jump-1"
  },
  {
      "number": 810,
      "species": "Grookey",
      "jump": "jump-5"
  },
  {
      "number": 811,
      "species": "Thwackey",
      "jump": "jump-4"
  },
  {
      "number": 812,
      "species": "Rillaboom",
      "jump": "jump-2"
  },
  {
      "number": 813,
      "species": "Scorbunny",
      "jump": "jump-5"
  },
  {
      "number": 814,
      "species": "Raboot",
      "jump": "jump-4"
  },
  {
      "number": 815,
      "species": "Cinderace",
      "jump": "jump-4"
  },
  {
      "number": 816,
      "species": "Sobble",
      "jump": "jump-4"
  },
  {
      "number": 817,
      "species": "Drizzile",
      "jump": "jump-4"
  },
  {
      "number": 818,
      "species": "Inteleon",
      "jump": "jump-3"
  },
  {
      "number": 819,
      "species": "Skwovet",
      "jump": "jump-5"
  },
  {
      "number": 820,
      "species": "Greedent",
      "jump": "jump-4"
  },
  {
      "number": 821,
      "species": "Rookidee",
      "jump": "jump-3"
  },
  {
      "number": 822,
      "species": "Corvisquire",
      "jump": "jump-3"
  },
  {
      "number": 823,
      "species": "Corviknight",
      "jump": "jump-2"
  },
  {
      "number": 824,
      "species": "Blipbug",
      "jump": "jump-4"
  },
  {
      "number": 825,
      "species": "Dottler",
      "jump": "jump-2"
  },
  {
      "number": 826,
      "species": "Orbeetle",
      "jump": "jump-2"
  },
  {
      "number": 827,
      "species": "Nickit",
      "jump": "jump-5"
  },
  {
      "number": 828,
      "species": "Thievul",
      "jump": "jump-5"
  },
  {
      "number": 829,
      "species": "Gossifleur",
      "jump": "jump-3"
  },
  {
      "number": 830,
      "species": "Eldegoss",
      "jump": "jump-2"
  },
  {
      "number": 831,
      "species": "Wooloo",
      "jump": "jump-4"
  },
  {
      "number": 832,
      "species": "Dubwool",
      "jump": "jump-4"
  },
  {
      "number": 833,
      "species": "Chewtle",
      "jump": "jump-3"
  },
  {
      "number": 834,
      "species": "Drednaw",
      "jump": "jump-1"
  },
  {
      "number": 835,
      "species": "Yamper",
      "jump": "jump-4"
  },
  {
      "number": 836,
      "species": "Boltund",
      "jump": "jump-4"
  },
  {
      "number": 837,
      "species": "Rolycoly",
      "jump": "jump-2"
  },
  {
      "number": 838,
      "species": "Carkol",
      "jump": "jump-1"
  },
  {
      "number": 839,
      "species": "Coalossal",
      "jump": "jump-1"
  },
  {
      "number": 840,
      "species": "Applin",
      "jump": "jump-3"
  },
  {
      "number": 841,
      "species": "Flapple",
      "jump": "jump-1"
  },
  {
      "number": 842,
      "species": "Appletun",
      "jump": "jump-2"
  },
  {
      "number": 843,
      "species": "Silicobra",
      "jump": "jump-2"
  },
  {
      "number": 844,
      "species": "Sandaconda",
      "jump": "jump-2"
  },
  {
      "number": 845,
      "species": "Cramorant",
      "jump": "jump-2"
  },
  {
      "number": 846,
      "species": "Arrokuda",
      "jump": "jump-1"
  },
  {
      "number": 847,
      "species": "Barraskewda",
      "jump": "jump-1"
  },
  {
      "number": 848,
      "species": "Toxel",
      "jump": "jump-1"
  },
  {
      "number": 849,
      "species": "Toxtricity Amped Form",
      "jump": "jump-3"
  },
  {
      "number": 849,
      "species": "Toxtricity Low Key Form",
      "jump": "jump-3"
  },
  {
      "number": 850,
      "species": "Sizzlipede",
      "jump": "jump-2"
  },
  {
      "number": 851,
      "species": "Centiskorch",
      "jump": "jump-2"
  },
  {
      "number": 852,
      "species": "Clobbopus",
      "jump": "jump-5"
  },
  {
      "number": 853,
      "species": "Grapploct",
      "jump": "jump-5"
  },
  {
      "number": 854,
      "species": "Sinistea Antique Form",
      "jump": "jump-1"
  },
  {
      "number": 854,
      "species": "Sinistea Phony Form",
      "jump": "jump-1"
  },
  {
      "number": 855,
      "species": "Polteageist Antique Form",
      "jump": "jump-1"
  },
  {
      "number": 855,
      "species": "Polteageist Phony Form",
      "jump": "jump-1"
  },
  {
      "number": 856,
      "species": "Hatenna",
      "jump": "jump-3"
  },
  {
      "number": 857,
      "species": "Hattrem",
      "jump": "jump-3"
  },
  {
      "number": 858,
      "species": "Hatterene",
      "jump": "jump-2"
  },
  {
      "number": 859,
      "species": "Impidimp",
      "jump": "jump-4"
  },
  {
      "number": 860,
      "species": "Morgrem",
      "jump": "jump-4"
  },
  {
      "number": 861,
      "species": "Grimmsnarl",
      "jump": "jump-3"
  },
  {
      "number": 862,
      "species": "Obstagoon",
      "jump": "jump-3"
  },
  {
      "number": 863,
      "species": "Perrserker",
      "jump": "jump-4"
  },
  {
      "number": 864,
      "species": "Cursola",
      "jump": "jump-1"
  },
  {
      "number": 865,
      "species": "Sirfetch'd",
      "jump": "jump-3"
  },
  {
      "number": 866,
      "species": "Mr. Rime",
      "jump": "jump-2"
  },
  {
      "number": 867,
      "species": "Runerigus",
      "jump": "jump-1"
  },
  {
      "number": 868,
      "species": "Milcery",
      "jump": "jump-3"
  },
  {
      "number": 869,
      "species": "Alcremie",
      "jump": "jump-2"
  },
  {
      "number": 870,
      "species": "Falinks",
      "jump": "jump-3"
  },
  {
      "number": 871,
      "species": "Pincurchin",
      "jump": "jump-2"
  },
  {
      "number": 872,
      "species": "Snom",
      "jump": "jump-2"
  },
  {
      "number": 873,
      "species": "Frosmoth",
      "jump": "jump-1"
  },
  {
      "number": 874,
      "species": "Stonjourner",
      "jump": "jump-1"
  },
  {
      "number": 875,
      "species": "Eiscue Ice Face",
      "jump": "jump-2"
  },
  {
      "number": 875,
      "species": "Eiscue Noice Face",
      "jump": "jump-4"
  },
  {
      "number": 876,
      "species": "Indeedee Female",
      "jump": "jump-3"
  },
  {
      "number": 876,
      "species": "Indeedee Male",
      "jump": "jump-3"
  },
  {
      "number": 877,
      "species": "Morpeko Full Belly Mode",
      "jump": "jump-5"
  },
  {
      "number": 877,
      "species": "Morpeko Hangry Mode",
      "jump": "jump-5"
  },
  {
      "number": 878,
      "species": "Cufant",
      "jump": "jump-1"
  },
  {
      "number": 879,
      "species": "Copperajah",
      "jump": "jump-1"
  },
  {
      "number": 880,
      "species": "Dracozolt",
      "jump": "jump-4"
  },
  {
      "number": 881,
      "species": "Arctozolt",
      "jump": "jump-3"
  },
  {
      "number": 882,
      "species": "Dracovish",
      "jump": "jump-4"
  },
  {
      "number": 883,
      "species": "Arctovish",
      "jump": "jump-1"
  },
  {
      "number": 884,
      "species": "Duraludon",
      "jump": "jump-1"
  },
  {
      "number": 885,
      "species": "Dreepy",
      "jump": "jump-2"
  },
  {
      "number": 886,
      "species": "Drakloak",
      "jump": "jump-2"
  },
  {
      "number": 887,
      "species": "Dragapult",
      "jump": "jump-2"
  },
  {
      "number": 888,
      "species": "Zacian Crowned Sword",
      "jump": "jump-6"
  },
  {
      "number": 888,
      "species": "Zacian Hero of Many Battles",
      "jump": "jump-6"
  },
  {
      "number": 889,
      "species": "Zamazenta Crowned Shield",
      "jump": "jump-6"
  },
  {
      "number": 889,
      "species": "Zamazenta Hero of Many Battles",
      "jump": "jump-6"
  },
  {
      "number": 890,
      "species": "Eternatus",
      "jump": "jump-1"
  },
  {
      "number": 890,
      "species": "Eternatus Eternamax",
      "jump": "jump-1"
  },
  {
      "number": 891,
      "species": "Kubfu",
      "jump": "jump-5"
  },
  {
      "number": 892,
      "species": "Urshifu Rapid Strike Style",
      "jump": "jump-5"
  },
  {
      "number": 892,
      "species": "Urshifu Single Strike Style",
      "jump": "jump-5"
  },
  {
      "number": 893,
      "species": "Zarude",
      "jump": "jump-6"
  },
  {
      "number": 894,
      "species": "Regieleki",
      "jump": "jump-4"
  },
  {
      "number": 895,
      "species": "Regidrago",
      "jump": "jump-3"
  },
  {
      "number": 896,
      "species": "Glastrier",
      "jump": "jump-5"
  },
  {
      "number": 897,
      "species": "Spectrier",
      "jump": "jump-5"
  },
  {
      "number": 898,
      "species": "Calyrex",
      "jump": "jump-1"
  },
  {
      "number": 898,
      "species": "Calyrex Ice Rider",
      "jump": "jump-5"
  },
  {
      "number": 898,
      "species": "Calyrex Shadow Rider",
      "jump": "jump-5"
  },
  {
      "number": 899,
      "species": "Wyrdeer",
      "jump": "jump-4"
  },
  {
      "number": 900,
      "species": "Kleavor",
      "jump": "jump-4"
  },
  {
      "number": 901,
      "species": "Ursaluna",
      "jump": "jump-1"
  },
  {
      "number": 901,
      "species": "Ursaluna Bloodmoon",
      "jump": "jump-1"
  },
  {
      "number": 902,
      "species": "Basculegion Female",
      "jump": "jump-2"
  },
  {
      "number": 902,
      "species": "Basculegion Male",
      "jump": "jump-2"
  },
  {
      "number": 903,
      "species": "Sneasler",
      "jump": "jump-5"
  },
  {
      "number": 904,
      "species": "Overqwil",
      "jump": "jump-1"
  },
  {
      "number": 905,
      "species": "Enamorus Incarnate Forme",
      "jump": "jump-1"
  },
  {
      "number": 905,
      "species": "Enamorus Therian Forme",
      "jump": "jump-2"
  },
  {
      "number": 906,
      "species": "Sprigatito",
      "jump": "jump-5"
  },
  {
      "number": 907,
      "species": "Floragato",
      "jump": "jump-5"
  },
  {
      "number": 908,
      "species": "Meowscarada",
      "jump": "jump-5"
  },
  {
      "number": 909,
      "species": "Fuecoco",
      "jump": "jump-3"
  },
  {
      "number": 910,
      "species": "Crocalor",
      "jump": "jump-2"
  },
  {
      "number": 911,
      "species": "Skeledirge",
      "jump": "jump-1"
  },
  {
      "number": 912,
      "species": "Quaxly",
      "jump": "jump-5"
  },
  {
      "number": 913,
      "species": "Quaxwell",
      "jump": "jump-4"
  },
  {
      "number": 914,
      "species": "Quaquaval",
      "jump": "jump-3"
  },
  {
      "number": 915,
      "species": "Lechonk",
      "jump": "jump-5"
  },
  {
      "number": 916,
      "species": "Oinkologne Female",
      "jump": "jump-3"
  },
  {
      "number": 916,
      "species": "Oinkologne Male",
      "jump": "jump-3"
  },
  {
      "number": 917,
      "species": "Tarountula",
      "jump": "jump-7"
  },
  {
      "number": 918,
      "species": "Spidops",
      "jump": "jump-6"
  },
  {
      "number": 919,
      "species": "Nymble",
      "jump": "jump-8"
  },
  {
      "number": 920,
      "species": "Lokix",
      "jump": "jump-7"
  },
  {
      "number": 921,
      "species": "Pawmi",
      "jump": "jump-4"
  },
  {
      "number": 922,
      "species": "Pawmo",
      "jump": "jump-4"
  },
  {
      "number": 923,
      "species": "Pawmot",
      "jump": "jump-3"
  },
  {
      "number": 924,
      "species": "Tandemaus",
      "jump": "jump-4"
  },
  {
      "number": 925,
      "species": "Maushold",
      "jump": "jump-4"
  },
  {
      "number": 926,
      "species": "Fidough",
      "jump": "jump-3"
  },
  {
      "number": 927,
      "species": "Dachsbun",
      "jump": "jump-3"
  },
  {
      "number": 928,
      "species": "Smoliv",
      "jump": "jump-2"
  },
  {
      "number": 929,
      "species": "Dolliv",
      "jump": "jump-2"
  },
  {
      "number": 930,
      "species": "Arboliva",
      "jump": "jump-1"
  },
  {
      "number": 931,
      "species": "Squawkabilly",
      "jump": "jump-4"
  },
  {
      "number": 932,
      "species": "Nacli",
      "jump": "jump-2"
  },
  {
      "number": 933,
      "species": "Naclstack",
      "jump": "jump-1"
  },
  {
      "number": 934,
      "species": "Garganacl",
      "jump": "jump-1"
  },
  {
      "number": 935,
      "species": "Charcadet",
      "jump": "jump-5"
  },
  {
      "number": 936,
      "species": "Armarouge",
      "jump": "jump-6"
  },
  {
      "number": 937,
      "species": "Ceruledge",
      "jump": "jump-6"
  },
  {
      "number": 938,
      "species": "Tadbulb",
      "jump": "jump-2"
  },
  {
      "number": 939,
      "species": "Bellibolt",
      "jump": "jump-2"
  },
  {
      "number": 940,
      "species": "Wattrel",
      "jump": "jump-2"
  },
  {
      "number": 941,
      "species": "Kilowattrel",
      "jump": "jump-2"
  },
  {
      "number": 942,
      "species": "Maschiff",
      "jump": "jump-4"
  },
  {
      "number": 943,
      "species": "Mabosstiff",
      "jump": "jump-4"
  },
  {
      "number": 944,
      "species": "Shroodle",
      "jump": "jump-5"
  },
  {
      "number": 945,
      "species": "Grafaiai",
      "jump": "jump-6"
  },
  {
      "number": 946,
      "species": "Bramblin",
      "jump": "jump-1"
  },
  {
      "number": 947,
      "species": "Brambleghast",
      "jump": "jump-1"
  },
  {
      "number": 948,
      "species": "Toedscool",
      "jump": "jump-3"
  },
  {
      "number": 949,
      "species": "Toedscruel",
      "jump": "jump-3"
  },
  {
      "number": 950,
      "species": "Klawf",
      "jump": "jump-2"
  },
  {
      "number": 951,
      "species": "Capsakid",
      "jump": "jump-2"
  },
  {
      "number": 952,
      "species": "Scovillain",
      "jump": "jump-2"
  },
  {
      "number": 953,
      "species": "Rellor",
      "jump": "jump-6"
  },
  {
      "number": 954,
      "species": "Rabsca",
      "jump": "jump-6"
  },
  {
      "number": 955,
      "species": "Flittle",
      "jump": "jump-2"
  },
  {
      "number": 956,
      "species": "Espathra",
      "jump": "jump-4"
  },
  {
      "number": 957,
      "species": "Tinkatink",
      "jump": "jump-4"
  },
  {
      "number": 958,
      "species": "Tinkatuff",
      "jump": "jump-4"
  },
  {
      "number": 959,
      "species": "Tinkaton",
      "jump": "jump-5"
  },
  {
      "number": 960,
      "species": "Wiglett",
      "jump": ""
  },
  {
      "number": 961,
      "species": "Wugtrio",
      "jump": ""
  },
  {
      "number": 962,
      "species": "Bombirdier",
      "jump": "jump-2"
  },
  {
      "number": 963,
      "species": "Finizen",
      "jump": "jump-2"
  },
  {
      "number": 964,
      "species": "Palafin Hero Form",
      "jump": "jump-5"
  },
  {
      "number": 964,
      "species": "Palafin Zero Form",
      "jump": "jump-2"
  },
  {
      "number": 965,
      "species": "Varoom",
      "jump": "jump-1"
  },
  {
      "number": 966,
      "species": "Revavroom",
      "jump": "jump-1"
  },
  {
      "number": 967,
      "species": "Cyclizar",
      "jump": "jump-4"
  },
  {
      "number": 968,
      "species": "Orthworm",
      "jump": "jump-3"
  },
  {
      "number": 969,
      "species": "Glimmet",
      "jump": ""
  },
  {
      "number": 970,
      "species": "Glimmora",
      "jump": ""
  },
  {
      "number": 971,
      "species": "Greavard",
      "jump": "jump-3"
  },
  {
      "number": 972,
      "species": "Houndstone",
      "jump": "jump-3"
  },
  {
      "number": 973,
      "species": "Flamigo",
      "jump": "jump-4"
  },
  {
      "number": 974,
      "species": "Cetoddle",
      "jump": "jump-2"
  },
  {
      "number": 975,
      "species": "Cetitan",
      "jump": "jump-1"
  },
  {
      "number": 976,
      "species": "Veluza",
      "jump": "jump-1"
  },
  {
      "number": 977,
      "species": "Dondozo",
      "jump": "jump-1"
  },
  {
      "number": 978,
      "species": "Tatsugiri Curly Form",
      "jump": "jump-1"
  },
  {
      "number": 978,
      "species": "Tatsugiri Droopy Form",
      "jump": "jump-1"
  },
  {
      "number": 978,
      "species": "Tatsugiri Stretchy Form",
      "jump": "jump-1"
  },
  {
      "number": 979,
      "species": "Annihilape",
      "jump": "jump-4"
  },
  {
      "number": 980,
      "species": "Clodsire",
      "jump": "jump-1"
  },
  {
      "number": 981,
      "species": "Farigiraf",
      "jump": "jump-3"
  },
  {
      "number": 982,
      "species": "Dudunsparce Three-Segment",
      "jump": "jump-3"
  },
  {
      "number": 982,
      "species": "Dudunsparce Two-Segment",
      "jump": "jump-3"
  },
  {
      "number": 983,
      "species": "Kingambit",
      "jump": "jump-2"
  },
  {
      "number": 984,
      "species": "Great Tusk",
      "jump": "jump-1"
  },
  {
      "number": 985,
      "species": "Scream Tail",
      "jump": "jump-3"
  },
  {
      "number": 986,
      "species": "Brute Bonnet",
      "jump": "jump-1"
  },
  {
      "number": 987,
      "species": "Flutter Mane",
      "jump": ""
  },
  {
      "number": 988,
      "species": "Slither Wing",
      "jump": "jump-4"
  },
  {
      "number": 989,
      "species": "Sandy Shocks",
      "jump": "jump-2"
  },
  {
      "number": 990,
      "species": "Iron Treads",
      "jump": "jump-1"
  },
  {
      "number": 991,
      "species": "Iron Bundle",
      "jump": "jump-3"
  },
  {
      "number": 992,
      "species": "Iron Hands",
      "jump": "jump-1"
  },
  {
      "number": 993,
      "species": "Iron Jugulis",
      "jump": "jump-1"
  },
  {
      "number": 994,
      "species": "Iron Moth",
      "jump": "jump-1"
  },
  {
      "number": 995,
      "species": "Iron Thorns",
      "jump": "jump-1"
  },
  {
      "number": 996,
      "species": "Frigibax",
      "jump": "jump-3"
  },
  {
      "number": 997,
      "species": "Arctibax",
      "jump": "jump-2"
  },
  {
      "number": 998,
      "species": "Baxcalibur",
      "jump": "jump-1"
  },
  {
      "number": 999,
      "species": "Gimmighoul Chest Form",
      "jump": "jump-1"
  },
  {
      "number": 999,
      "species": "Gimmighoul Roaming Form",
      "jump": "jump-5"
  },
  {
      "number": 1000,
      "species": "Gholdengo",
      "jump": "jump-3"
  },
  {
      "number": 1001,
      "species": "Wo-Chien",
      "jump": "jump-2"
  },
  {
      "number": 1002,
      "species": "Chien-Pao",
      "jump": "jump-6"
  },
  {
      "number": 1003,
      "species": "Ting-Lu",
      "jump": "jump-4"
  },
  {
      "number": 1004,
      "species": "Chi-Yu",
      "jump": "jump-1"
  },
  {
      "number": 1005,
      "species": "Roaring Moon",
      "jump": "jump-2"
  },
  {
      "number": 1006,
      "species": "Iron Valiant",
      "jump": "jump-3"
  },
  {
      "number": 1007,
      "species": "Koraidon",
      "jump": "jump-5"
  },
  {
      "number": 1008,
      "species": "Miraidon",
      "jump": "jump-5"
  },
  {
      "number": 1009,
      "species": "Walking Wake",
      "jump": "jump-4"
  },
  {
      "number": 1010,
      "species": "Iron Leaves",
      "jump": "jump-5"
  },
  {
      "number": 1011,
      "species": "Dipplin",
      "jump": "jump-1"
  },
  {
      "number": 1012,
      "species": "Poltchageist Artisan",
      "jump": "jump-1"
  },
  {
      "number": 1012,
      "species": "Poltchageist Counterfeit",
      "jump": "jump-1"
  },
  {
      "number": 1013,
      "species": "Sinistcha Masterpiece",
      "jump": "jump-1"
  },
  {
      "number": 1013,
      "species": "Sinistcha Unremarkable",
      "jump": "jump-1"
  },
  {
      "number": 1014,
      "species": "Okidogi",
      "jump": "jump-4"
  },
  {
      "number": 1015,
      "species": "Munkidori",
      "jump": "jump-5"
  },
  {
      "number": 1016,
      "species": "Fezandipiti",
      "jump": "jump-3"
  },
  {
      "number": 1017,
      "species": "Ogerpon Cornerstone Mask",
      "jump": "jump-5"
  },
  {
      "number": 1017,
      "species": "Ogerpon Hearthflame Mask",
      "jump": "jump-5"
  },
  {
      "number": 1017,
      "species": "Ogerpon Teal Mask",
      "jump": "jump-5"
  },
  {
      "number": 1017,
      "species": "Ogerpon Wellspring Mask",
      "jump": "jump-5"
  },
  {
      "number": 1018,
      "species": "Archaludon",
      "jump": "jump-1"
  },
  {
      "number": 1019,
      "species": "Hydrapple",
      "jump": "jump-1"
  },
  {
      "number": 1020,
      "species": "Gouging Fire",
      "jump": "jump-3"
  },
  {
      "number": 1021,
      "species": "Raging Bolt",
      "jump": "jump-2"
  },
  {
      "number": 1022,
      "species": "Iron Boulder",
      "jump": "jump-5"
  },
  {
      "number": 1023,
      "species": "Iron Crown",
      "jump": "jump-5"
  },
  {
      "number": 1024,
      "species": "Terapagos",
      "jump": "jump-4"
  },
  {
      "number": 1024,
      "species": "Terapagos Stellar Form",
      "jump": "jump-1"
  },
  {
      "number": 1024,
      "species": "Terapagos Terastal Form",
      "jump": "jump-1"
  },
  {
      "number": 1025,
      "species": "Pecharunt",
      "jump": "jump-3"
  }
]

const dataMap = new Map(data.map(data => [data.number, data]));

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-species");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const speciesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!speciesData.system) throw new Error(`Missing system data in ${filePath}`);
  const data = dataMap.get(speciesData.system.number);
  if(!data) {
    if(![
      "PTR 2e Core - Kanto Dex",
      "PTR 2e Core - Johto Dex",
      "PTR 2e Core - Hoenn Dex",
      "PTR 2e Core - Sinnoh Dex",
      "PTR 2e Core - Unova Dex",
      "PTR 2e Core - Kalos Dex",
      "PTR 2e Core - Alola Dex",
      "PTR 2e Core - Galar Dex",
      "PTR 2e Core - Hisui Dex",
      "PTR 2e Core - Paldea Dex",
    ].includes(speciesData.system.publication?.source)) continue;
    throw new Error(`Missing data for ${speciesData.system.number} in ${filePath}`);
  }

  speciesData.system.traits = Array.from(new Set([...speciesData.system.traits, data.jump]));

  fs.writeFileSync(filePath, JSON.stringify(speciesData, null, 2));
}