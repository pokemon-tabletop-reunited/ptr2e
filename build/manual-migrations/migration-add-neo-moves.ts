import fs from "fs";
import path from "path";
import url from "url";
import { sluggify } from "../lib/helpers.ts";

const data = [
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Abrasion",
    "type": "move",
    "_id": "zOCbwGAS17dyQdNW",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Abrasion Attack",
          "slug": "abrasion-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "status",
          "power": null,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target gains Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target gains Splinter 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721265630655,
      "modifiedTime": 1721265718836,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aftershock",
    "type": "move",
    "_id": "RuQs6by7zFAgsOhU",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "delay-3",
        "earthbound"
      ],
      "actions": [
        {
          "name": "Aftershock Attack",
          "slug": "aftershock-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "delay-3",
            "earthbound"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": 3,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target was hit with an [Earthbound] attack since the user's previous Activation, this Attack gains [Danger Close] and has its Power tripled.</p>"
        }
      ],
      "description": "<p>Effect: If the target was hit with an [Earthbound] attack since the user's previous Activation, this Attack gains [Danger Close] and has its Power tripled.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798088437,
      "modifiedTime": 1720798229258,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Air Raid",
    "type": "move",
    "_id": "xwk1Zm5233VHiy4O",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "contact",
        "dash",
        "recoil-1-4",
        "priority-1"
      ],
      "actions": [
        {
          "name": "Air Raid Attack",
          "slug": "air-raid-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "contact",
            "dash",
            "recoil-1-4",
            "priority-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": 1,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596998515,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Allure",
    "type": "move",
    "_id": "IUAdsck8n65uFtIr",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "friendly",
        "priority-2"
      ],
      "actions": [
        {
          "name": "Allure Attack",
          "slug": "allure-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "friendly",
            "priority-2"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": 2,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets are Taunted 5 and Charmed 5.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets are Taunted 5 and Charmed 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720809169909,
      "modifiedTime": 1720809607935,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aloe Palm",
    "type": "move",
    "_id": "DrobmpKV7dlHeCpu",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Aloe Palm Attack",
          "slug": "aloe-palm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target has Burn, this attack's Power is doubled and the target is cured of Burn after the attack resolves.</p>"
        }
      ],
      "description": "<p>Effect: If the target has Burn, this attack's Power is doubled and the target is cured of Burn after the attack resolves.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720455210095,
      "modifiedTime": 1720455286708,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Alpha Crystal",
    "type": "move",
    "_id": "kHWvzXwb2BpQ5phK",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing",
        "legendary",
        "hazard"
      ],
      "actions": [
        {
          "name": "Alpha Crystal Attack",
          "slug": "alpha-crystal-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing",
            "legendary",
            "hazard"
          ],
          "range": {
            "target": "object",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user places 5 floating crystals within Range. When a creature moves within 2m of a crystal, it homes in on them and heals a Tick of Hit Points.</p>"
        }
      ],
      "description": "<p>Effect: The user places 5 floating crystals within Range. When a creature moves within 2m of a crystal, it homes in on them and heals 3 Ticks of Hit Points.</p>",
      "container": null,
      "grade": "S"
    },
    "effects": [],
    "sort": 200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718991316111,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ancient Lullaby",
    "type": "move",
    "_id": "Q1rrTWS3dm19iNJw",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Ancient Lullaby Attack",
          "slug": "ancient-lullaby-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Drowsy 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Drowsy 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718739137919,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aqua Whip",
    "type": "move",
    "_id": "danJpjz4UbHfwGgb",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Aqua Whip Attack",
          "slug": "aqua-whip-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -1 DEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -1 DEF stage for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314679087,
      "modifiedTime": 1721314766786,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Arc Lightning",
    "type": "move",
    "_id": "ySSwKtbPwbNDexgM",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-4"
      ],
      "actions": [
        {
          "name": "Arc Lightning Attack",
          "slug": "arc-lightning-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-4"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718740424831,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Arctic Assault",
    "type": "move",
    "_id": "S9uVSrfgSxZpX41l",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Arctic Assault Attack",
          "slug": "arctic-assault-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 85 to 170.</p><blockquote><p>Damage Formula: Power = min(170, (15*UserSPD / TargetSPD) + 85)</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 85 to 170.</p><blockquote><p>Damage Formula: Power = min(170, (15*UserSPD / TargetSPD) + 85)</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720810966075,
      "modifiedTime": 1720811057290,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ashburn",
    "type": "move",
    "_id": "cOd1Ss6RXCpNhxHP",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Ashburn Attack",
          "slug": "ashburn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target has Burn, this Attack's Power is doubled.</p>"
        }
      ],
      "description": "<p>Effect: If the target has Burn, this Attack's Power is doubled.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720454800785,
      "modifiedTime": 1720455025703,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Astro Sphere",
    "type": "move",
    "_id": "PVLb1GbzZwagnI5N",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode",
        "blast-2",
        "pulse"
      ],
      "actions": [
        {
          "name": "Astro Sphere Attack",
          "slug": "astro-sphere-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode",
            "blast-2",
            "pulse"
          ],
          "range": {
            "target": "blast",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 85,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Confused 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721260611530,
      "modifiedTime": 1721260755542,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aura Flow",
    "type": "move",
    "_id": "WdBm7dWzlgBe65RF",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing",
        "set-up",
        "aura"
      ],
      "actions": [
        {
          "name": "Aura Flow Attack",
          "slug": "aura-flow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing",
            "set-up",
            "aura"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user starts to meditate, taking note of their current HP, gains Resolved 2, then their activation ends.</p><p>Resolution: On their next activation, they can select 1 creature on the field (which can be the user), to recover HP equal to 1/2 the user's HP they had at the time this Attack was initially used.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user starts to meditate, taking note of their current HP, gains Resolved 2, then their activation ends.</p><p>Resolution: On their next activation, they can select 1 creature on the field (which can be the user), to recover HP equal to 1/2 the user's HP they had at the time this Attack was initially used.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587693375,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aura Spark",
    "type": "move",
    "_id": "iJ2NejusI5Rv9Jzk",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse",
        "aura"
      ],
      "actions": [
        {
          "name": "Aura Spark Attack",
          "slug": "aura-spark-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse",
            "aura"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "special",
          "power": 45,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587362182,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Aura Storm",
    "type": "move",
    "_id": "Oloonyqp6ZSHZ50Z",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "aura",
        "pulse",
        "blast-3",
        "delay-2"
      ],
      "actions": [
        {
          "name": "Aura Storm Attack",
          "slug": "aura-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "smite",
            "aura",
            "pulse",
            "blast-3",
            "delay-2"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user loses -2 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -2 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1719588389526,
      "modifiedTime": 1720456000698,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Backstab",
    "type": "move",
    "_id": "Upx4IzsJQjLSZp5m",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "contact",
        "sharp",
        "crit-1"
      ],
      "actions": [
        {
          "name": "Backstab Attack",
          "slug": "backstab-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "contact",
            "sharp",
            "crit-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 90,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains +2 EVA stages for 2 Activations, and ends their activation.</p><p>Resolution: On their next activation, the user freely Moves up to one-and-a-half times the Movement Score of their choice and attacks with and resolves Backstab. If the target is unaware of the user or the target is in the middle of a Set-Up attack, Backstab gains [Crit 4].</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains +2 EVA stages for 2 Activations, and ends their activation.</p><p>Resolution: On their next activation, the user freely Moves up to one-and-a-half times the Movement Score of their choice and attacks with and resolves Backstab. If the target is unaware of the user or the target is in the middle of a Set-Up attack, Backstab gains [Crit 4].</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 12800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718734680723,
      "modifiedTime": 1719972394261,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Banish",
    "type": "move",
    "_id": "iaqzJUkhfUPXQ6nV",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "friendly"
      ],
      "actions": [
        {
          "name": "Banish Attack",
          "slug": "banish-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets gain Fear 5.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets gain Fear 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 13000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735018665,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Banshee Shriek",
    "type": "move",
    "_id": "H46ay2gSvsLxUn5m",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Banshee Shriek Attack",
          "slug": "banshee-shriek-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720459500659,
      "modifiedTime": 1720459632556,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Barbed Sting",
    "type": "move",
    "_id": "xdbOtdj7vrl3TmMl",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "horn",
        "contact"
      ],
      "actions": [
        {
          "name": "Barbed Sting Attack",
          "slug": "barbed-sting-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "horn",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of being Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of being Confused 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 11500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718726811729,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bark",
    "type": "move",
    "_id": "h2xOusyckAvQlQtf",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "basic"
      ],
      "actions": [
        {
          "name": "Bark Attack",
          "slug": "bark-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "basic"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Flinch 2.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Flinch 2.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813254885,
      "modifiedTime": 1720813458366,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Battle Cry",
    "type": "move",
    "_id": "5i2aOmrfd4ewvOoF",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "social"
      ],
      "actions": [
        {
          "name": "Battle Cry Attack",
          "slug": "battle-cry-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "social"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +1 ATK and SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +1 ATK and SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587443802,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Beak Smash",
    "type": "move",
    "_id": "Khoz32xXscQk7coq",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Beak Smash Attack",
          "slug": "beak-smash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 1000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597107843,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Belly Flop",
    "type": "move",
    "_id": "S5Gis0BxAAmglQ1n",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Belly Flop Attack",
          "slug": "belly-flop-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact"
          ],
          "range": {
            "target": "enemy",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314866872,
      "modifiedTime": 1721314942632,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Beta Flame",
    "type": "move",
    "_id": "UmMomo9fvLXSMZIq",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "contact",
        "legendary"
      ],
      "actions": [
        {
          "name": "Beta Flame Attack",
          "slug": "beta-flame-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "contact",
            "legendary"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user may freely move themselves up to half of the Movement Score of their choice away from the target. If the user is an owned Pokémon, they may then immediately be returned their Poké Ball and another Pokémon may immediately be sent out in their place. On hit, the target has a 20% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user may freely move themselves up to half of the Movement Score of their choice away from the target. If the user is an owned Pokémon, they may then immediately be returned their Poké Ball and another Pokémon may immediately be sent out in their place. On hit, the target has a 20% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 1100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719594774230,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bewitch",
    "type": "move",
    "_id": "Wh7nWwzI4J1tdBFD",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Bewitch Attack",
          "slug": "bewitch-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 7,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 55,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack's Power is doubled if the target is afflicted with a Major Status Affliction.</p>"
        }
      ],
      "description": "<p>Effect: This Attack's Power is doubled if the target is afflicted with a Major Status Affliction.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 1200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718991481800,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bio-Toxin",
    "type": "move",
    "_id": "wsWnvbrkaOjrl8dr",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "horn"
      ],
      "actions": [
        {
          "name": "Bio-Toxin Attack",
          "slug": "bio-toxin-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: For each consecutive time this attack hits after the first, Bio-Toxin's Power doubles up to a maximum power of 160. Bio-Toxin's Power resets if the user is switched out, fainted, combat ends or an item is used on the user.</p>"
        }
      ],
      "description": "<p>Effect: For each consecutive time this attack hits after the first, Bio-Toxin's Power doubles up to a maximum power of 160. Bio-Toxin's Power resets if the user is switched out, fainted, combat ends or an item is used on the user.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256089077,
      "modifiedTime": 1721256139124,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bitter Wind",
    "type": "move",
    "_id": "3IsU6BEflEJK9dIE",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "wind"
      ],
      "actions": [
        {
          "name": "Bitter Wind Attack",
          "slug": "bitter-wind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "wind"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Frozen 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Frozen 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811155570,
      "modifiedTime": 1720811217155,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Blade Clash",
    "type": "move",
    "_id": "XYnUAGlKJUVYHuYS",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "sharp"
      ],
      "actions": [
        {
          "name": "Blade Clash Attack",
          "slug": "blade-clash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "sharp"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack calculates damage against the target's ATK, rather than DEF.</p>"
        }
      ],
      "description": "<p>Effect: This attack calculates damage against the target's ATK, rather than DEF.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721310150982,
      "modifiedTime": 1721310252765,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Blossom Blast",
    "type": "move",
    "_id": "JqKqCFtxFcZapiSf",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-3"
      ],
      "actions": [
        {
          "name": "Blossom Blast Attack",
          "slug": "blossom-blast-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-3"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of losing -1 EVA stage for 5 Activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720455332161,
      "modifiedTime": 1720455504941,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bolt Arrow",
    "type": "move",
    "_id": "5aUTOWaN9NEY8Sqw",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crit-1",
        "ray"
      ],
      "actions": [
        {
          "name": "Bolt Arrow Attack",
          "slug": "bolt-arrow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crit-1",
            "ray"
          ],
          "range": {
            "target": "line",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 1300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718740541884,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bone Smash",
    "type": "move",
    "_id": "XWiIyX75tkJ233vX",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "recoil-1-3",
        "crushing",
        "contact",
        "bone"
      ],
      "actions": [
        {
          "name": "Bone Smash Attack",
          "slug": "bone-smash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "recoil-1-3",
            "crushing",
            "contact",
            "bone"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798241501,
      "modifiedTime": 1720798311927,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bonebreaker",
    "type": "move",
    "_id": "hLyqNensyLCZnAaa",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "crit-1",
        "punch",
        "kick"
      ],
      "actions": [
        {
          "name": "Bonebreaker Attack",
          "slug": "bonebreaker-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "crit-1",
            "punch",
            "kick"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 1400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589639625,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Boomerang",
    "type": "move",
    "_id": "79FHYCJv86g7IqQm",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "2-strike",
        "missile"
      ],
      "actions": [
        {
          "name": "Boomerang Attack",
          "slug": "boomerang-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "2-strike",
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 1500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587543582,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Boulder Crash",
    "type": "move",
    "_id": "enF8AAdlKOLJj2aN",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crash-1-2",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Boulder Crash Attack",
          "slug": "boulder-crash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crash-1-2",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 130,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721265971954,
      "modifiedTime": 1721266020728,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Box In",
    "type": "move",
    "_id": "iWdcVdEe3eMHGjUu",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Box In Attack",
          "slug": "box-in-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack's Power is dependent on the target's Size Category, ranging from 20 to 140.</p><blockquote><p>Damage Formula: Power = min(140, targetCatMod*20+20)</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack's Power is dependent on the target's Size Category, ranging from 20 to 140.</p><blockquote><p>Damage Formula: Power = min(140, targetCatMod*20+20)</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721260610434,
      "modifiedTime": 1721261432358,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bravado",
    "type": "move",
    "_id": "P8RUhIFOVmZNQLxH",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Bravado Attack",
          "slug": "bravado-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -1 DEF for 5 activations, and the user gains +1 ATK for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -1 DEF for 5 activations, and the user gains +1 ATK for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813407073,
      "modifiedTime": 1721263340201,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bubble Storm",
    "type": "move",
    "_id": "IancatghBK4ezIBP",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Bubble Storm Attack",
          "slug": "bubble-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "wide-line",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 55,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -2 SPD stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -2 SPD stages for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721316150202,
      "modifiedTime": 1721316399440,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Bunker Buster",
    "type": "move",
    "_id": "NhuMc1zQyP4kM5QG",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pierce",
        "explode",
        "missile"
      ],
      "actions": [
        {
          "name": "Bunker Buster Attack",
          "slug": "bunker-buster-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pierce",
            "explode",
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": "The target has a [Shield] effect when this attack is declared."
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Trigger: The target has a [Shield] effect when this attack is declared.</p><p>Effect: This attack's Power is tripled, and on hit, the target gains Flinched 5.</p>"
        }
      ],
      "description": "<p>Trigger: The target has a [Shield] effect when this attack is declared.</p><p>Effect: This attack's Power is tripled, and on hit, the target gains Flinched 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721266070226,
      "modifiedTime": 1721266974548,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Burn Bash",
    "type": "move",
    "_id": "W800izqlYUAA4IiN",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "contact",
        "environ"
      ],
      "actions": [
        {
          "name": "Burn Bash Attack",
          "slug": "burn-bash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "contact",
            "environ"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Scorched Terrain or Sunny Weather, then they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolves this attack. On hit, the target gains Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Scorched Terrain or Sunny Weather, then they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolves this attack. On hit, the target gains Burn 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 1600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719594888818,
      "modifiedTime": 1719972445279,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Buzz",
    "type": "move",
    "_id": "JTdu8u9oOJQKxFhl",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "basic"
      ],
      "actions": [
        {
          "name": "Buzz Attack",
          "slug": "buzz-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "basic"
          ],
          "range": {
            "target": "emanation",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>On hit, all valid targets have a 10% chance of being Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Confused 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 11600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718727848252,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Calcify",
    "type": "move",
    "_id": "B1YsAslEtkV7hpRE",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Calcify Attack",
          "slug": "calcify-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The target gains the Rock Type in addition to its other Types for 7 activations.</p>"
        }
      ],
      "description": "<p>Effect: The target gains the Rock Type in addition to its other Types for 7 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721267002956,
      "modifiedTime": 1721267314622,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cannonball",
    "type": "move",
    "_id": "uB7OpAzpqG8MaerT",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crash-1-2",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Cannonball Attack",
          "slug": "cannonball-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crash-1-2",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721316420033,
      "modifiedTime": 1721316775372,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Capacitor Rip",
    "type": "move",
    "_id": "cMhxKUlKI0UEOGWq",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-2",
        "contact",
        "grapple"
      ],
      "actions": [
        {
          "name": "Capacitor Rip Attack",
          "slug": "capacitor-rip-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-2",
            "contact",
            "grapple"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 1700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719583776615,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cast Off",
    "type": "move",
    "_id": "bpyOVLZ5IqZhB6dG",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing",
        "pulse"
      ],
      "actions": [
        {
          "name": "Cast Off Attack",
          "slug": "cast-off-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing",
            "pulse"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 10,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack's Power increases by +15 for every Major Affliction and +5 for every Minor Affliction the user possesses. The user is cured of all of their Major and Minor Afflictions upon resolving this attack.</p>"
        }
      ],
      "description": "<p>Effect: This attack's Power increases by +15 for every Major Affliction and +5 for every Minor Affliction the user possesses. The user is cured of all of their Major and Minor Afflictions upon resolving this attack.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813516890,
      "modifiedTime": 1720813599535,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Centennial Storm",
    "type": "move",
    "_id": "IBCrbgQ2cdtcgr7V",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ",
        "blast-5",
        "legendary",
        "wind",
        "sky"
      ],
      "actions": [
        {
          "name": "Centennial Storm Attack",
          "slug": "centennial-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ",
            "blast-5",
            "legendary",
            "wind",
            "sky"
          ],
          "range": {
            "target": "creature",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 13,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 150,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If there is an active [Weather], Weather Storm's Type changes to match a Type associated with the Weather Chart (user's Choice).</p>"
        }
      ],
      "description": "<p>Effect: If there is an active [Weather], Weather Storm's Type changes to match a Type associated with the Weather Chart (user's Choice).</p>",
      "container": null,
      "grade": "S"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721162816460,
      "modifiedTime": 1721162933806,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Chaotic Rage",
    "type": "move",
    "_id": "eM8NOELXS7QX1lth",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "contact",
        "3-strike",
        "dash"
      ],
      "actions": [
        {
          "name": "Chaotic Rage Attack",
          "slug": "chaotic-rage-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "contact",
            "3-strike"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user gains Enraged 5.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user gains Enraged 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 12900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718734827988,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Chemical Bomb",
    "type": "move",
    "_id": "oFc4st3EDC06T5pj",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sky",
        "environ",
        "explode"
      ],
      "actions": [
        {
          "name": "Chemical Bomb Attack",
          "slug": "chemical-bomb-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sky",
            "environ",
            "explode"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Poisoned 5. If Smoggy Weather is active, this attack gains [Danger Close]. </p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Poisoned 5. If Smoggy Weather is active, this attack gains [Danger Close]. </p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256209589,
      "modifiedTime": 1721256291391,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Chemical Burn",
    "type": "move",
    "_id": "U94QNaJRzulZFgSX",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Chemical Burn Attack",
          "slug": "chemical-burn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "enemy",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null
        }
      ],
      "description": "<p>Effect: On hit, the target has a 50% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256415586,
      "modifiedTime": 1721256578592,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Chill Out",
    "type": "move",
    "_id": "ATin7GkQR5amxAP4",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ"
      ],
      "actions": [
        {
          "name": "Chill Out Attack",
          "slug": "chill-out-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all legal targets lose -1 ATK and SPD stages for 5 activations. If there is Snowy Weather, they are decreased by -2 for 7 activations instead.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all legal targets lose -1 ATK and SPD stages for 5 activations. If there is Snowy Weather, they are decreased by -2 for 7 activations instead.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811246964,
      "modifiedTime": 1720811341414,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Chord Strike",
    "type": "move",
    "_id": "wirv9632jLaUTePt",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "contact"
      ],
      "actions": [
        {
          "name": "Chord Strike Attack",
          "slug": "chord-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of being Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of being Confused 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813635389,
      "modifiedTime": 1720813737305,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Clangor",
    "type": "move",
    "_id": "agzkVidQZLl8r9CK",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Clangor Attack",
          "slug": "clangor-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 45,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Any creatures with the Drowsy Affliction in Range are cured of Drowsy.</p>"
        }
      ],
      "description": "<p>Effect: Any creatures with the Drowsy Affliction in Range are cured of Drowsy.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721311933643,
      "modifiedTime": 1721312182524,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Clear Rain",
    "type": "move",
    "_id": "sV6vNBZXnI9bkivl",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing"
      ],
      "actions": [
        {
          "name": "Clear Rain Attack",
          "slug": "clear-rain-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user recovers 8 Ticks of HP. While Rainy Weather is present, the user recovers 12 Ticks of HP and while In any other Weather, the user only recovers 4 Ticks of HP.</p>"
        }
      ],
      "description": "<p>Effect: The user recovers 8 Ticks of HP. While Rainy Weather is present, the user recovers 12 Ticks of HP and while In any other Weather, the user only recovers 4 Ticks of HP.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317016995,
      "modifiedTime": 1721317101491,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cocoon",
    "type": "move",
    "_id": "AoeIoPclAZull3th",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "trap"
      ],
      "actions": [
        {
          "name": "Cocoon Attack",
          "slug": "cocoon-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>The user is Bound 5 and Braced 5. While afflicted with these conditions, the user heals two Ticks of HP at the end of each of their activations. The user may otherwise remove this Bound Condition with a Complex Action.</p>"
        }
      ],
      "description": "<p>Effect: The user is Bound 5 and Braced 5. While afflicted with these conditions, the user heals two Ticks of HP at the end of each of their activations. The user may otherwise remove this Bound Condition with a Complex Action.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 11700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729134609,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Coin Toss",
    "type": "move",
    "_id": "Fc0dou1nNElQeFVw",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Coin Toss Attack",
          "slug": "coin-toss-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Roll 1d6 and flip a coin. On a heads the target is inflicted with the corresponding Status Affliction for 5 activations, and on Tails both the user and target are inflicted with corresponding Status Affliction for 5 activations.</p><p>1. Burn, 2. Drowsy, 3. Frozen, 4. Paralysis, 5. Poison, 6. Splinter</p>"
        }
      ],
      "description": "<p>Effect: Roll 1d6 and flip a coin. On a heads the target is inflicted with the corresponding Status Affliction for 5 activations, and on Tails both the user and target are inflicted with corresponding Status Affliction for 5 activations.</p><p>1. Burn, 2. Drowsy, 3. Frozen, 4. Paralysis, 5. Poison, 6. Splinter</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813810417,
      "modifiedTime": 1720813861948,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cold Shower",
    "type": "move",
    "_id": "X4UeEekMxBqroGN7",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Cold Shower Attack",
          "slug": "cold-shower-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All creatures on the Field have their [Stage Change] effects removed.</p>"
        }
      ],
      "description": "<p>Effect: All creatures on the Field have their [Stage Change] effects removed.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317300013,
      "modifiedTime": 1721317423401,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cold Snap",
    "type": "move",
    "_id": "EfxpZM6iq4Rzmo7n",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Cold Snap Attack",
          "slug": "cold-snap-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "status",
          "power": null,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target is afflicted with Frozen 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target is afflicted with Frozen 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811361494,
      "modifiedTime": 1720811437147,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cold Terror",
    "type": "move",
    "_id": "aVPukPwsMPZz0Q0q",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Cold Terror Attack",
          "slug": "cold-terror-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Frozen 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Frozen 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720459678710,
      "modifiedTime": 1720459752090,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Comet Strike",
    "type": "move",
    "_id": "mFzJKUaLbQQxLMqu",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "priority-1",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Comet Strike Attack",
          "slug": "comet-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "priority-1",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 1800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595099066,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Compost Bomb",
    "type": "move",
    "_id": "4nYU1kkuySn4RWeA",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode",
        "blast-1"
      ],
      "actions": [
        {
          "name": "Compost Bomb Attack",
          "slug": "compost-bomb-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode",
            "blast-1"
          ],
          "range": {
            "target": "blast",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the user has consumed a [Food] item this battle, this Attack's Power doubles, its [Blast X] increases by +1, and this Attack's chance to inflict Flinched increases by +10. On hit, all valid targets have a 10% chance of being Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: If the user has consumed a [Food] item this battle, this Attack's Power doubles, its [Blast X] increases by +1, and this Attack's chance to inflict Flinched increases by +10. On hit, all valid targets have a 10% chance of being Flinched 3.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720792966943,
      "modifiedTime": 1720796716672,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Corrode",
    "type": "move",
    "_id": "IMvY0LoT5PWC8bJE",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Corrode Attack",
          "slug": "corrode-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The target gains Hindered 5. If the Hindered creature is Steel-Type, it can be damaged by the user's Poison-Type attacks.</p>"
        }
      ],
      "description": "<p>Effect: The target gains Hindered 5. If the target is Steel-Type, it can be damaged by the user's Poison-Type attacks while it's Hindered.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256303918,
      "modifiedTime": 1721256610304,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Cosmic Ray",
    "type": "move",
    "_id": "OOFQWv78kIqdsKvw",
    "img": "systems/ptr2e/img/icons/nuclear_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Cosmic Ray Attack",
          "slug": "cosmic-ray-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "line",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "nuclear"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Paralysis 5, a 10% chance of gaining Burn 5, a 10% chance of gaining Freeze 5, a 10% chance of gaining Drowsy 5, and a 10% chance of gaining Poison 5. The user loses -1 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Paralysis 5, a 10% chance of gaining Burn 5, a 10% chance of gaining Freeze 5, a 10% chance of gaining Drowsy 5, and a 10% chance of gaining Poison 5. The user loses -1 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721067022290,
      "modifiedTime": 1721067344152,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crackling Zap",
    "type": "move",
    "_id": "e5Bpd0v091oNRHL3",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crit-4"
      ],
      "actions": [
        {
          "name": "Crackling Zap Attack",
          "slug": "crackling-zap-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crit-4"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 1900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718740655168,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crescent Ray",
    "type": "move",
    "_id": "ijYLLpmhyS7pp4fq",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "defensive",
        "ray",
        "environ"
      ],
      "actions": [
        {
          "name": "Crescent Ray Attack",
          "slug": "crescent-ray-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "defensive",
            "ray",
            "environ"
          ],
          "range": {
            "target": "line",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains +1 DEF and SPATK stage for 5 activations, and ends their activation. If the weather is Gloomy, the user Sets-Up and resolves Crescent Ray on the same activation. </p><p>Resolution: On their next activation, they attack with and resolve Crescent Ray. If the weather is not Gloomy or Clear, Crescent Ray's Power is reduced by 50%.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains +1 DEF and SPATK stage for 5 activations, and ends their activation. If the weather is Gloomy, the user Sets-Up and resolves Crescent Ray on the same activation. </p><p>Resolution: On their next activation, they attack with and resolve Crescent Ray. If the weather is not Gloomy or Clear, Crescent Ray's Power is reduced by 50%.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 2000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718991660237,
      "modifiedTime": 1719972458665,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crimson Flare",
    "type": "move",
    "_id": "INzyfHmEPKoG0GrM",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "defrost"
      ],
      "actions": [
        {
          "name": "Crimson Flare Attack",
          "slug": "crimson-flare-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "defrost"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 13200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735243197,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crop Circle",
    "type": "move",
    "_id": "L76U1uEyjFTIdBYM",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-3"
      ],
      "actions": [
        {
          "name": "Crop Circle Attack",
          "slug": "crop-circle-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-3"
          ],
          "range": {
            "target": "blast",
            "distance": 12,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "special",
          "power": 55,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets have a 50% chance of being Suppressed 5 and a 50% chance of being Dazzled 5.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets have a 50% chance of being Suppressed 5 and a 50% chance of being Dazzled 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720793907109,
      "modifiedTime": 1720796649966,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crystal Shine",
    "type": "move",
    "_id": "vLoli8T5CAKj9RIj",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray",
        "pulse"
      ],
      "actions": [
        {
          "name": "Crystal Shine Attack",
          "slug": "crystal-shine-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray",
            "pulse"
          ],
          "range": {
            "target": "wide-line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user loses -2 SPATK stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -2 SPATK stages for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721267328850,
      "modifiedTime": 1721267595091,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Crystallize",
    "type": "move",
    "_id": "9YPfb2tkInYHqaOE",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ"
      ],
      "actions": [
        {
          "name": "Crystallize Attack",
          "slug": "crystallize-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: The user's DEF and SPDEF stages increase by +1 for 5 activations. If there is Dusty Weather, DEF and SPDEF stages are increased by +2 for 7 activations instead.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721267690789,
      "modifiedTime": 1721267744140,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Daring Dash",
    "type": "move",
    "_id": "06p8JDAR0B1bVn4A",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Daring Dash Attack",
          "slug": "daring-dash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": 95,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user has a 30% chance of gaining +1 ATK and SPD stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user has a 30% chance of gaining +1 ATK and SPD stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813877686,
      "modifiedTime": 1720814020732,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Darkened Deluge",
    "type": "move",
    "_id": "1yuWSxT358M4qGs7",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ",
        "wind"
      ],
      "actions": [
        {
          "name": "Darkened Deluge Attack",
          "slug": "darkened-deluge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ",
            "wind"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If Gloomy Weather is active, this Attack's Range is doubled.</p>"
        }
      ],
      "description": "<p>Effect: If Gloomy Weather is active, this Attack's Range is doubled.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 13400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735442449,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dazzling Burst",
    "type": "move",
    "_id": "BLK8jLf1lFPzkVxh",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Dazzling Burst Attack",
          "slug": "dazzling-burst-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all targets have a 30% chance of gaining Dazzled 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all targets have a 30% chance of gaining Dazzled 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 2100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718991831151,
      "modifiedTime": 1720456032909,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Decimate",
    "type": "move",
    "_id": "W9xhtexpOAbunFlR",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Decimate Attack",
          "slug": "decimate-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of losing -3 DEF stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of losing -3 DEF stages for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 13500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735569768,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Deep Frost",
    "type": "move",
    "_id": "XN0rAuudg3KIQVkP",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Deep Frost Attack",
          "slug": "deep-frost-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -1 ATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -1 ATK stage for 5 activations.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811551731,
      "modifiedTime": 1720811624694,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Deke",
    "type": "move",
    "_id": "xawzh01dPugjMv0F",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "priority-2",
        "contact",
        "push-2"
      ],
      "actions": [
        {
          "name": "Deke Attack",
          "slug": "deke-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "priority-2",
            "contact",
            "push-2"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has 30% chance of gaining Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has 30% chance of gaining Flinched 3.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 2200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587979129,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Delta Wave",
    "type": "move",
    "_id": "wamFPzwvhAmEwyBL",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary"
      ],
      "actions": [
        {
          "name": "Delta Wave Attack",
          "slug": "delta-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Frozen 5. The user also clears any [Hazards] directly adjacent to themself and ends any [Trap] effects the user is affected by.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Frozen 5. The user also clears any [Hazards] directly adjacent to themself and ends any [Trap] effects the user is affected by.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317451464,
      "modifiedTime": 1721317567785,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Derecho",
    "type": "move",
    "_id": "81aECy3Mfq1pnaUR",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind",
        "crit-1",
        "delay-1"
      ],
      "actions": [
        {
          "name": "Derecho Attack",
          "slug": "derecho-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind",
            "crit-1",
            "delay-1"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": 1,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 2300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597293220,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Descending Crash",
    "type": "move",
    "_id": "thnvOSGowuREF5nm",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crash-1-2",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Descending Crash Attack",
          "slug": "descending-crash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crash-1-2",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 130,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 2400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719598276220,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Destroyer Driver",
    "type": "move",
    "_id": "aHqcfBnfz59hYKhU",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact",
        "punch"
      ],
      "actions": [
        {
          "name": "Destroyer Driver Attack",
          "slug": "destroyer-driver-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact",
            "punch"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting",
            "dark"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is considered to be both Fighting and Dark Type.</p>"
        }
      ],
      "description": "<p>Effect: This attack is considered to be both Fighting and Dark Type.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 2500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719588119177,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dies Irae",
    "type": "move",
    "_id": "e0DTjd6XAQcwhfwj",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary"
      ],
      "actions": [
        {
          "name": "Dies Irae Attack",
          "slug": "dies-irae-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary"
          ],
          "range": {
            "target": "emanation",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720463252934,
      "modifiedTime": 1720463331529,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dirty Trick",
    "type": "move",
    "_id": "lR3Agvw0pZLHAAW4",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "interrupt-1",
        "contact"
      ],
      "actions": [
        {
          "name": "Dirty Trick Attack",
          "slug": "dirty-trick-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "interrupt-1",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": 1,
            "trigger": "You are targeted by a Physical- or Special-Category Attack."
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Trigger: You are targeted by a Physical- or Special-Category Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with this Attack. If the target Faints due to damage from this Attack, the triggering attack fails.</p>"
        }
      ],
      "description": "<p>Trigger: You are targeted by a Physical- or Special-Category Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with this Attack. If the target Faints due to damage from this Attack, the triggering attack fails.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798421636,
      "modifiedTime": 1720798571137,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Disturbance",
    "type": "move",
    "_id": "Oy8yo8Avimo2OxjJ",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Disturbance Attack",
          "slug": "disturbance-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "status",
          "power": null,
          "accuracy": 75,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -3 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -3 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 13600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735693427,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Doom Scythe",
    "type": "move",
    "_id": "pX8nkNhCfYldjbH8",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp"
      ],
      "actions": [
        {
          "name": "Doom Scythe Attack",
          "slug": "doom-scythe-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp"
          ],
          "range": {
            "target": "cone",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Cursed 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Cursed 3.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720459801545,
      "modifiedTime": 1720461538650,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Draco Comet",
    "type": "move",
    "_id": "vEjUm4ZxvgNR6Li8",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2",
        "missile",
        "crit-2"
      ],
      "actions": [
        {
          "name": "Draco Comet Attack",
          "slug": "draco-comet-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2",
            "missile",
            "crit-2"
          ],
          "range": {
            "target": "blast",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 2600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718739464824,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Draco Wave",
    "type": "move",
    "_id": "9uyrkbjglFaIiqhR",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "danger-close",
        "pulse"
      ],
      "actions": [
        {
          "name": "Draco Wave Attack",
          "slug": "draco-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "danger-close",
            "pulse"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "special",
          "power": 60,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 2700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718739726596,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dragonic Furor",
    "type": "move",
    "_id": "islqj264YiP2IXc4",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Dragonic Furor Attack",
          "slug": "dragonic-furor-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +1 ATK and SPD stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +1 ATK and SPD stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 2800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718740083204,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dragonic Raze",
    "type": "move",
    "_id": "g10keN6MAlPM3GdY",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-4"
      ],
      "actions": [
        {
          "name": "Dragonic Raze Attack",
          "slug": "dragonic-raze-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "smite",
            "blast-4"
          ],
          "range": {
            "target": "blast",
            "distance": 12,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolving this attack, the user loses -1 DEF and SPDEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolving this attack, the user loses -1 DEF and SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 2900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718739305244,
      "modifiedTime": 1720456056200,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Drain Life",
    "type": "move",
    "_id": "HeAnrKHB3Uuj29fi",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-2"
      ],
      "actions": [
        {
          "name": "Drain Life Attack",
          "slug": "drain-life-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-2"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 11800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729297755,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dusk Embrace",
    "type": "move",
    "_id": "aLhxy2aW2BfjOkWT",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "danger-close"
      ],
      "actions": [
        {
          "name": "Dusk Embrace Attack",
          "slug": "dusk-embrace-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "danger-close"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "special",
          "power": 60,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 13800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735907890,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Dust Guard",
    "type": "move",
    "_id": "v9Rx4SC4DCKFFXT2",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Dust Guard Attack",
          "slug": "dust-guard-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "emanation",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>All valid targets are covered in a protective Dust for 5 activations. If a creature covered in Dust would be affected by the Effects of a Physical or Special-Category attack they are instead not affected.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets are covered in a protective Dust for 5 activations. If a creature covered in Dust would be affected by the Effects of a Physical or Special-Category attack they are instead not affected.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 11900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729402356,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Eagle Eye",
    "type": "move",
    "_id": "cmcc6QDvzvDSNQXd",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Eagle Eye Attack",
          "slug": "eagle-eye-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains +3 ACC stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user gains +3 ACC stages for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 3000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597425781,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ear Splitter",
    "type": "move",
    "_id": "h12l8VL48hEHB94L",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Ear Splitter Attack",
          "slug": "ear-splitter-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 11,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets gain Hindered 5 and Vulnerable 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets gain Hindered 5 and Vulnerable 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720814035679,
      "modifiedTime": 1720814134355,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ebon Maw",
    "type": "move",
    "_id": "4N1si8pCwTGJxBlM",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "2-strike",
        "jaw",
        "crushing",
        "contact",
        "dash"
      ],
      "actions": [
        {
          "name": "Ebon Maw Attack",
          "slug": "ebon-maw-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "2-strike",
            "jaw",
            "crushing",
            "contact",
            "dash"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Engulfed. The target is cured of Engulfed when the user uses another [Jaw] attack, and the target gains Splintered 5 when that happens.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Engulfed. The target is cured of Engulfed when the user uses another [Jaw] attack, and the target gains Splintered 5 when that happens.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798582942,
      "modifiedTime": 1720798687818,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Echo Blast",
    "type": "move",
    "_id": "94ptq8J3PI7PcUn2",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "delay-2",
        "sonic"
      ],
      "actions": [
        {
          "name": "Echo Blast Attack",
          "slug": "echo-blast-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "delay-2",
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": 2,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target was hit with an [Sonic] attack since the user's previous Activation, this Attack gains [Danger Close] and has its Power double.</p>"
        }
      ],
      "description": "<p>Effect: If the target was hit with an [Sonic] attack since the user's previous Activation, this Attack gains [Danger Close] and has its Power double.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720814147929,
      "modifiedTime": 1720814394849,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Echo Chirp",
    "type": "move",
    "_id": "oFpvVEDAC1s3IXJN",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "2-strike",
        "delay-2",
        "sonic"
      ],
      "actions": [
        {
          "name": "Echo Chirp Attack",
          "slug": "echo-chirp-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "2-strike",
            "delay-2",
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 12000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729593400,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ecto Shot",
    "type": "move",
    "_id": "pEuMVS4ZuxSYWjsD",
    "img": "/systems/ptr2e/img/icons/untyped_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Ecto Shot Attack",
          "slug": "ecto-shot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "enemy",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720461574430,
      "modifiedTime": 1720461574430,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Electroburn",
    "type": "move",
    "_id": "ww6edyhA67Br8BSD",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Electroburn Attack",
          "slug": "electroburn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Paralysis 5, and a 20% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Paralysis 5, and a 20% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 3100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718741980322,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Emerald Beam",
    "type": "move",
    "_id": "j1tZkEqgvHUEmBri",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Emerald Beam Attack",
          "slug": "emerald-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721267852004,
      "modifiedTime": 1721267992541,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Energize",
    "type": "move",
    "_id": "AFPraPDM6UatTs2D",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Energize Attack",
          "slug": "energize-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user raises their DEF and SPATK stages by +1 for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user raises their DEF and SPATK stages by +1 for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 3200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742091168,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Energy Drain",
    "type": "move",
    "_id": "ndw1HdRqs2t1Asgu",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-4"
      ],
      "actions": [
        {
          "name": "Energy Drain Attack",
          "slug": "energy-drain-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-4"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Suppressed 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Suppressed 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721261454739,
      "modifiedTime": 1721261503273,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Equilibrium",
    "type": "move",
    "_id": "Rs004mM7Sc7AyY88",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ"
      ],
      "actions": [
        {
          "name": "Equilibrium Attack",
          "slug": "equilibrium-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 10,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All current [Terrain] and [Room] effects end and all [Hazards] on the field are removed.</p>"
        }
      ],
      "description": "<p>Effect: All current [Terrain] and [Room] effects end and all [Hazards] on the field are removed.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721057672166,
      "modifiedTime": 1721057766698,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Face Slap",
    "type": "move",
    "_id": "6nUC7c21UaNPNlHO",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Face Slap Attack",
          "slug": "face-slap-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target's [Stat Change] effects are removed.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target's [Stat Change] effects are removed.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 13700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735805276,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fae Bind",
    "type": "move",
    "_id": "aCyPTYcHB6eKBN1W",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "trap",
        "blast-1"
      ],
      "actions": [
        {
          "name": "Fae Bind Attack",
          "slug": "fae-bind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "trap",
            "blast-1"
          ],
          "range": {
            "target": "blast",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 3300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719583981528,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fae Fury",
    "type": "move",
    "_id": "5H0E9S8PB2Rk0zr9",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "legendary"
      ],
      "actions": [
        {
          "name": "Fae Fury Attack",
          "slug": "fae-fury-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "legendary"
          ],
          "range": {
            "target": "emanation",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains Choice-Locked 2. While Choice-Locked, the user does not consume PP. After these activations, the user is Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: The user gains Choice-Locked 2. While Choice-Locked, the user does not consume PP. After these activations, the user is Confused 5.</p>",
      "container": null,
      "grade": "S"
    },
    "effects": [],
    "sort": 3400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718991929091,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fairy Jinx",
    "type": "move",
    "_id": "WPGxbmWz95ZrKOxn",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Fairy Jinx Attack",
          "slug": "fairy-jinx-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, roll 1d8 and drop the target's stages of the stat in the corresponding table by -2 for 5 activations.</p><p>1. ATK, 2. DEF, 3. SPATK, 4. SPDEF, 5. SPD, 6. ACC, 7. EVA, 8. User Choice</p>"
        }
      ],
      "description": "<p>Effect: On hit, roll 1d8 and drop the target's stages of the stat in the corresponding table by -2 for 5 activations.</p><p>1. ATK, 2. DEF, 3. SPATK, 4. SPDEF, 5. SPD, 6. ACC, 7. EVA, 8. User Choice</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 3500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718992127121,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "False Image",
    "type": "move",
    "_id": "8dNzDl2zTtIeHhEu",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "False Image Attack",
          "slug": "false-image-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 95,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack uses the target's SPATK stat for damage calculation instead of the user's.</p>"
        }
      ],
      "description": "<p>Effect: This attack uses the target's SPATK stat for damage calculation instead of the user's.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721261954782,
      "modifiedTime": 1721262038320,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fanfare",
    "type": "move",
    "_id": "hT9fkOAbBoQZZe6T",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Fanfare Attack",
          "slug": "fanfare-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +2 SPD stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +2 SPD stages for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 3600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584103826,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Feather Storm",
    "type": "move",
    "_id": "xrRLC1dlRYbGPCeh",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Feather Storm Attack",
          "slug": "feather-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597545585,
      "modifiedTime": 1719972093678,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fell Breath",
    "type": "move",
    "_id": "YdOUuKrJhcO6PyuI",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Fell Breath Attack",
          "slug": "fell-breath-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 75,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Poison 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Poison 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 13900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735986029,
      "modifiedTime": 1719972162825,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ferric Flow",
    "type": "move",
    "_id": "TOcoTU5VT55oSkwA",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Ferric Flow Attack",
          "slug": "ferric-flow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "wide-line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721312167634,
      "modifiedTime": 1721312269092,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fertility",
    "type": "move",
    "_id": "WPux3VJ0W8S2b5ci",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing",
        "hazard",
        "trap",
        "environ"
      ],
      "actions": [
        {
          "name": "Fertility Attack",
          "slug": "fertility-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing",
            "hazard",
            "trap",
            "environ"
          ],
          "range": {
            "target": "object",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720809318401,
      "modifiedTime": 1720809573780,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fiery Rouse",
    "type": "move",
    "_id": "E6WCvGC3q0nlMrxu",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "social"
      ],
      "actions": [
        {
          "name": "Firey Rouse Attack",
          "slug": "firey-rouse-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "social"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +1 SPD and +1 CRIT for 5 Activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +1 SPD and +1 CRIT for 5 Activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 3700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595399291,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Final Gasp",
    "type": "move",
    "_id": "yuLL5Nhx6QrRJRnm",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "desperation-1-3"
      ],
      "actions": [
        {
          "name": "Final Gasp Attack",
          "slug": "final-gasp-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "desperation-1-3"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains Stuck 5, Splinter 5, and Perish 5. The user then gains +1 ATK, DEF, SPATK, SPDEF, SPD, ACC, EVA stages for 5 Activations. If the user meets the Depseration Trigger, they gain +2 stages instead of +1.</p>"
        }
      ],
      "description": "<p>Effect: The user gains Stuck 5, Splinter 5, and Perish 5. The user then gains +1 ATK, DEF, SPATK, SPDEF, SPD, ACC, EVA stages for 5 Activations. If the user meets the Depseration Trigger, they gain +2 stages instead of +1.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721057790133,
      "modifiedTime": 1721061410300,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fireball Barrage",
    "type": "move",
    "_id": "QdQZvHS0jdLNjGSq",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "missile"
      ],
      "actions": [
        {
          "name": "Fireball Barrage Attack",
          "slug": "fireball-barrage-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 25,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 3800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595298146,
      "modifiedTime": 1719972542690,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Floodlight",
    "type": "move",
    "_id": "JdIDoH8iOAt9or6W",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Floodlight Attack",
          "slug": "floodlight-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317586688,
      "modifiedTime": 1721317640081,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fluster",
    "type": "move",
    "_id": "SsZMpYYF6maLTq2U",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Fluster Attack",
          "slug": "fluster-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -1 SPDEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -1 SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721061350901,
      "modifiedTime": 1721061483208,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Flying Haymaker",
    "type": "move",
    "_id": "wqdSQ8Uh46vogd0K",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "punch",
        "contact"
      ],
      "actions": [
        {
          "name": "Flying Haymaker Attack",
          "slug": "flying-haymaker-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "punch",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 95,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user is able to freely use up to half their Overland Score or their full Flight Score if available to jump towards their target upon declaring this attack. On hit, the target has a 10% chance of gaining Flinched 5.</p>"
        }
      ],
      "description": "<p>Effect: The user is able to freely use up to half their Overland Score or their full Flight Score if available to jump towards their target upon declaring this attack. On hit, the target has a 10% chance of gaining Flinched 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 3900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719588234792,
      "modifiedTime": 1719972655032,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Foam Geyser",
    "type": "move",
    "_id": "QQdcdMmapVEDrBmQ",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2",
        "sky"
      ],
      "actions": [
        {
          "name": "Foam Geyser Attack",
          "slug": "foam-geyser-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2",
            "sky"
          ],
          "range": {
            "target": "blast",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have  a 30% chance of losing -1 EVA stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have  a 30% chance of losing -1 EVA stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317653966,
      "modifiedTime": 1721317800995,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Frenzy Rush",
    "type": "move",
    "_id": "ZNl94X4B6JuegB6H",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "contact",
        "priority-2",
        "sharp",
        "jaw",
        "horn"
      ],
      "actions": [
        {
          "name": "Frenzy Rush Attack",
          "slug": "frenzy-rush-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "contact",
            "priority-2",
            "sharp",
            "jaw",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": 2,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 28,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721061528562,
      "modifiedTime": 1721061659865,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Friction Burn",
    "type": "move",
    "_id": "ZiWtx5GEBdxzOK96",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "priority-3",
        "contact"
      ],
      "actions": [
        {
          "name": "Friction Burn Attack",
          "slug": "friction-burn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "priority-3",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target and the user gain Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target and the user gain Burn 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720455081079,
      "modifiedTime": 1720455163313,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Frigid Spear",
    "type": "move",
    "_id": "kLMbC5TmWVfaJREL",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Frigid Spear Attack",
          "slug": "frigid-spear-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "creature",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving this Attack.</p>"
        }
      ],
      "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving this Attack.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811649739,
      "modifiedTime": 1720811762730,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Fusillade",
    "type": "move",
    "_id": "9BaYqT1PJMZKfcXo",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "10-strike",
        "missile",
        "explode"
      ],
      "actions": [
        {
          "name": "Fusillade Attack",
          "slug": "fusillade-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "10-strike",
            "missile",
            "explode"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 25,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721312289895,
      "modifiedTime": 1721312537326,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Gamma Spire",
    "type": "move",
    "_id": "amxgoUkda7VI2mRn",
    "img": "systems/ptr2e/img/icons/nuclear_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound",
        "hazard",
        "legendary"
      ],
      "actions": [
        {
          "name": "Gamma Spire Attack",
          "slug": "gamma-spire-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound",
            "hazard",
            "legendary"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "nuclear"
          ],
          "category": "physical",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Poisoned 5. On resolution, the user freely uses Toxic Spikes.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Poisoned 5. On resolution, the user freely uses Toxic Spikes.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798707913,
      "modifiedTime": 1720798803517,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Gemlight",
    "type": "move",
    "_id": "KyDXujh6wQu91mZ8",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse",
        "basic"
      ],
      "actions": [
        {
          "name": "Gemlight Attack",
          "slug": "gemlight-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse",
            "basic"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268011675,
      "modifiedTime": 1721268127117,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Gentle Repose",
    "type": "move",
    "_id": "PM5dVuLn2TWi1FmH",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "psychic",
        "social"
      ],
      "actions": [
        {
          "name": "Gentle Repose Attack",
          "slug": "gentle-repose-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "psychic",
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Drowsy 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Drowsy 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721262442108,
      "modifiedTime": 1721262551598,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ghastly Eye",
    "type": "move",
    "_id": "l4OCqffPkRevnVbM",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Ghastly Eye Attack",
          "slug": "ghastly-eye-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains True Sight 3 and can hit Normal-Type creatures with Ghost-Type attacks while they have True Sight.</p>"
        }
      ],
      "description": "<p>Effect: The user gains True Sight 3 and can hit Normal-Type creatures with Ghost-Type attacks while they have True Sight.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720802205230,
      "modifiedTime": 1720808458399,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ghostly Touch",
    "type": "move",
    "_id": "RYOLZDuG3iAIidDg",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Ghostly Touch Attack",
          "slug": "ghostly-touch-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "status",
          "power": null,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: The target loses -1 SPATK and SPDEF stages for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720808487325,
      "modifiedTime": 1720808600311,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Glacier Crush",
    "type": "move",
    "_id": "b2XsJq8rj59RYXnm",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "dash",
        "defensive",
        "curl",
        "contact",
        "crushing"
      ],
      "actions": [
        {
          "name": "Glacier Crush Attack",
          "slug": "glacier-crush-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "dash",
            "defensive",
            "curl",
            "contact",
            "crushing"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains +1 ATK and SPDEF stage for 5 activations, and ends their activation. If Snowy Weather is present, the user Sets Up and resolves this attack on the same activation. </p><p>Resolution: On their next activation, they attack with and resolve this attack.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains +1 ATK and SPDEF stage for 5 activations, and ends their activation. If Snowy Weather is present, the user Sets Up and resolves this attack on the same activation. </p><p>Resolution: On their next activation, they attack with and resolve this attack.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720811778464,
      "modifiedTime": 1720812190239,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Glitter Glow",
    "type": "move",
    "_id": "IMcT7NIcZVJxrJKN",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "healing",
        "blast-1",
        "powder",
        "missile"
      ],
      "actions": [
        {
          "name": "Glitter Glow Attack",
          "slug": "glitter-glow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "healing",
            "blast-1",
            "powder",
            "missile"
          ],
          "range": {
            "target": "blast",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If this attack hits an allied creature, that creature recovers HP equal to half the user's Max HP instead of taking damage.</p>"
        }
      ],
      "description": "<p>Effect: If this attack hits an allied creature, that creature recovers HP equal to half the user's Max HP instead of taking damage.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 4000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584220148,
      "modifiedTime": 1719972795831,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "name": "Gloam Glimmer",
    "type": "move",
    "_id": "iB9zlfy1Lueiv99W",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Gloam Glimmer Attack",
          "slug": "gloam-glimmer-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "wide-line",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 55,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "folder": "PTzDJPvM7Mjj7e8k",
    "sort": 12600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718736129556,
      "modifiedTime": 1719972851177,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Goblin Claw",
    "type": "move",
    "_id": "HbQlx24xMIhHFXrp",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "crit-1",
        "pass-2",
        "contact"
      ],
      "actions": [
        {
          "name": "Goblin Claw Attack",
          "slug": "goblin-claw-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "crit-1",
            "pass-2",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user steals the target's equipped Acessory item or one Belt item and equips it on themself. If the user already has an equipped Accessory or Belt item, the stolen item is dropped on the ground in a square adjacent to the target.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user steals the target's equipped Acessory item or one Belt item and equips it on themself. If the user already has an equipped Accessory or Belt item, the stolen item is dropped on the ground in a square adjacent to the target.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 4100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584394154,
      "modifiedTime": 1719972919971,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Granite Gouge",
    "type": "move",
    "_id": "1tcXfZB9S5hx36OT",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Granite Gouge Attack",
          "slug": "granite-gouge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Splintered 5, and a 20% of losing -1 DEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Splintered 5, and a 20% of losing -1 DEF stage for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268195932,
      "modifiedTime": 1721268264362,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Great Rumbling",
    "type": "move",
    "_id": "quofPlFl4Y6FYS8W",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "earthbound"
      ],
      "actions": [
        {
          "name": "Great Rumbling Attack",
          "slug": "great-rumbling-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "earthbound"
          ],
          "range": {
            "target": "cone",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Slowed 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Slowed 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720798821407,
      "modifiedTime": 1720798973118,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Guerilla Strike",
    "type": "move",
    "_id": "yZVYh36dnfxTtiuk",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Guerilla Strike Attack",
          "slug": "guerilla-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user may freely move themselves up to half of the Movement Score of their choice away from the target. If the user is an owned Pokémon, they may then immediately be returned their Poké Ball and another Pokémon may immediately be sent out in their place.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user may freely move themselves up to half of the Movement Score of their choice away from the target. If the user is an owned Pokémon, they may then immediately be returned their Poké Ball and another Pokémon may immediately be sent out in their place.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 4200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718737181262,
      "modifiedTime": 1719972994489,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Heat Seeker",
    "type": "move",
    "_id": "2e47fmZKDFxEm2xa",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "danger-close",
        "missile"
      ],
      "actions": [
        {
          "name": "Heat Seeker Attack",
          "slug": "heat-seeker-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "danger-close",
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 4300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595516529,
      "modifiedTime": 1719973033977,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Heat Spike",
    "type": "move",
    "_id": "7chNkzYXefJ5PmBA",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ"
      ],
      "actions": [
        {
          "name": "Heat Spike Attack",
          "slug": "heat-spike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all legal targets lose -1 ATK and SPATK stages for 5 activations. If there is Sunny Weather, they are decreased by -2 for 7 activations instead.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all legal targets lose -1 ATK and SPATK stages for 5 activations. If there is Sunny Weather, they are decreased by -2 for 7 activations instead.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 4400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595596606,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hemlock",
    "type": "move",
    "_id": "3pzCp6OqubSNFLnp",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "interrupt-4"
      ],
      "actions": [
        {
          "name": "Hemlock Attack",
          "slug": "hemlock-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "interrupt-4"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": "A creature in range uses an attack with the [Drain] or [Healing] keyword."
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Trigger: A creature in range uses an attack with the [Drain] or [Healing] keyword.</p><p>Effect: Any HP healed by the triggering attack are instead dealt as damage to the designated target, and any status afflictions that would be cured instead gain +3 stacks.</p>"
        }
      ],
      "description": "<p>Trigger: A creature in range uses an attack with the [Drain] or [Healing] keyword.</p><p>Effect: Any HP healed by the triggering attack are instead dealt as damage to the designated target, and any status afflictions that would be cured instead gain +3 stacks.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256624274,
      "modifiedTime": 1721266857740,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Heroic Rally",
    "type": "move",
    "_id": "hott3x4xss13fP3g",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Heroic Rally Attack",
          "slug": "heroic-rally-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "special",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains Boosted X, where X equals the number of allied creatures that have Fainted during this battle.</p>"
        }
      ],
      "description": "<p>Effect: The user gains Boosted X and Resolved X, where X equals the number of allied creatures that have Fainted during this battle.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 4500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719588764712,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hidden Gift",
    "type": "move",
    "_id": "absRVVXrbQVTVKr7",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Hidden Gift Attack",
          "slug": "hidden-gift-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The effect of Hidden Gift differs based on the user's highest stat.</p><p>HP: The target's Type is changed to a random Type that does not include any of their current Types for 5 activations.</p><p>ATK: The target loses -1 DEF and SPDEF stages for 5 activations.</p><p>DEF: The target cannot activate [Shield] and [Defensive] effects for the remainder of combat.</p><p>SPATK: Creatures allied to the user that are adjacent to the target gain +1 ATK and SPATK for 2 activations.</p><p>SPDEF: The user is cured of any and all Minor Afflictions.</p><p>SPD: The user rolls 2d8. The stats corresponding to the rolled numbers gain +1 stage for 5 activations. 1- ATK, 2- DEF, 3- SPATK, 4- SPDEF, 5- SPD, 6- ACC, 7- EVA, 8- User Choice.</p>"
        }
      ],
      "description": "<p>Effect: The effect of Hidden Gift differs based on the user's highest stat.</p><p>HP: The target's Type is changed to a random Type that does not include any of their current Types for 5 activations.</p><p>ATK: The target loses -1 DEF and SPDEF stages for 5 activations.</p><p>DEF: The target cannot activate [Shield] and [Defensive] effects for the remainder of combat.</p><p>SPATK: Creatures allied to the user that are adjacent to the target gain +1 ATK and SPATK for 2 activations.</p><p>SPDEF: The user is cured of any and all Minor Afflictions.</p><p>SPD: The user rolls 2d8. The stats corresponding to the rolled numbers gain +1 stage for 5 activations. 1- ATK, 2- DEF, 3- SPATK, 4- SPDEF, 5- SPD, 6- ACC, 7- EVA, 8- User Choice.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721061682332,
      "modifiedTime": 1721062366900,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "High-Speed Dive",
    "type": "move",
    "_id": "N8GXzFdyI906GMB9",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "dash",
        "push-1",
        "contact"
      ],
      "actions": [
        {
          "name": "High-Speed Dive Attack",
          "slug": "high-speed-dive-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "dash",
            "push-1",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack's Power is based on how much heavier the user is compared to the target, ranging from 20 to 100.</p><blockquote><p>Damage Formula: Power = max(100, min(20, 10 x (UserWC-TargetWC)))</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack's Power is based on how much heavier the user is compared to the target, ranging from 20 to 100.</p><blockquote><p>Damage Formula: Power = max(100, min(20, 10 x (UserWC-TargetWC)))</p></blockquote>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 4600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597946682,
      "modifiedTime": 1719973196082,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hiss",
    "type": "move",
    "_id": "5Ujk98dns0FfRZVc",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social",
        "sonic",
        "friendly"
      ],
      "actions": [
        {
          "name": "Hiss Attack",
          "slug": "hiss-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social",
            "sonic",
            "friendly"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -1 SPATK stages for 5 activations. </p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -1 SPATK stages for 5 activations. </p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721062427077,
      "modifiedTime": 1721062513436,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Honor Guard",
    "type": "move",
    "_id": "mBftHZyPPfUhdJQY",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social",
        "sonic"
      ],
      "actions": [
        {
          "name": "Honor Guard Attack",
          "slug": "honor-guard-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social",
            "sonic"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +1 DEF and SPDEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +1 DEF and SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 4700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589060330,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hot Coals",
    "type": "move",
    "_id": "jIE1FEgL3SkZvac7",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "hazard",
        "blast-4"
      ],
      "actions": [
        {
          "name": "Hot Coals Attack",
          "slug": "hot-coals-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "enemy",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null
        }
      ],
      "description": "<p>Effect: Burning hot coals are spread over the [Blast] area. A creature that starts an Activation in a space containing Hot Coals, they gain Burn 3. A creature that moves Overland through the Hazard gains Burn 1 for each square travelled. After gaining 4 stacks of Burn from Movement in one Round, the creature gains Hindered and Stunted equal to the number of Burn stacks they currently have.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 4800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595707417,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Howling Blaster",
    "type": "move",
    "_id": "fxrN2gavIB3MZQ4Q",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse"
      ],
      "actions": [
        {
          "name": "Howling Blaster Attack",
          "slug": "howling-blaster-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse"
          ],
          "range": {
            "target": "wide-line",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user loses -2 SPATK stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user loses -2 SPATK stages for 5 activations.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812027217,
      "modifiedTime": 1720812088686,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hydra Strike",
    "type": "move",
    "_id": "WD8qBqTk0ottL3S7",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "10-strike",
        "contact",
        "jaw"
      ],
      "actions": [
        {
          "name": "Hydra Strike Attack",
          "slug": "hydra-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "10-strike",
            "contact",
            "jaw"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison",
            "dragon"
          ],
          "category": "physical",
          "power": 18,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% change of gaining Poisoned 5. This attack also possesses the Poison Type.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% change of gaining Poisoned 5. This attack also possesses the Poison Type.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 4900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718739892481,
      "modifiedTime": 1719973279184,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hydraulic Crush",
    "type": "move",
    "_id": "ypHfAkv2tboU6si7",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "jaw",
        "contact"
      ],
      "actions": [
        {
          "name": "Hydraulic Crush Attack",
          "slug": "hydraulic-crush-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "jaw",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire",
            "water"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721317974349,
      "modifiedTime": 1721318099739,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hydrolysis",
    "type": "move",
    "_id": "MZs1e84dHCiNg6Dt",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-2"
      ],
      "actions": [
        {
          "name": "Hydrolysis Attack",
          "slug": "hydrolysis-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-2"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721318312626,
      "modifiedTime": 1721318452464,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hyperfocus",
    "type": "move",
    "_id": "lDhXrL2TjvIlWpBB",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Hyperfocus Attack",
          "slug": "hyperfocus-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains +1 SPATK, ACC, and CRIT stages for 5 activations, and loses -2 EVA stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user gains +1 SPATK, ACC, and CRIT stages for 5 activations, and loses -2 EVA stages for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721262573914,
      "modifiedTime": 1721262618175,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Hypersonic Fist",
    "type": "move",
    "_id": "JUfnUTj1tgU3KWcM",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "punch",
        "sonic"
      ],
      "actions": [
        {
          "name": "Hypersonic Fist Attack",
          "slug": "hypersonic-fist-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "punch",
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 5000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719588964329,
      "modifiedTime": 1719973335107,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ice Breaker",
    "type": "move",
    "_id": "VQoxlzG07F3AJgIc",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "recoil-1-3",
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Ice Breaker Attack",
          "slug": "ice-breaker-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "recoil-1-3",
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812108056,
      "modifiedTime": 1720812249749,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ice Drill",
    "type": "move",
    "_id": "b2wmiBlUnQSHayUN",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Ice Drill Attack",
          "slug": "ice-drill-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target has Frozen, this attack's Power doubles and the target is cured of Frozen.</p>"
        }
      ],
      "description": "<p>Effect: If the target has Frozen, this attack's Power doubles and the target is cured of Frozen.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812361420,
      "modifiedTime": 1720812429877,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Immolation",
    "type": "move",
    "_id": "H7VxovyJlOiqxb0B",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "recoil-1-4"
      ],
      "actions": [
        {
          "name": "Immolation Attack",
          "slug": "immolation-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "recoil-1-4"
          ],
          "range": {
            "target": "emanation",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 11,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all legal targets have a 50% chance of gaining Burn 7. The user also clears any [Hazards] within this attack's range.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all legal targets have a 50% chance of gaining Burn 7. The user also clears any [Hazards] within this attack's range.</p>",
      "container": null,
      "grade": "S"
    },
    "effects": [],
    "sort": 5100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595807413,
      "modifiedTime": 1719973388086,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Indomitable Spirit",
    "type": "move",
    "_id": "X5CuD9kHbx6EAhzj",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "aura"
      ],
      "actions": [
        {
          "name": "Indomitable Spirit Attack",
          "slug": "indomitable-spirit-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "aura"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user increases their ATK stage by +3 for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user increases their ATK stage by +3 for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 5200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589528282,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Inferno Roar",
    "type": "move",
    "_id": "D2QvFTdtId7JPSt3",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "legendary",
        "push-x"
      ],
      "actions": [
        {
          "name": "Inferno Roar Attack",
          "slug": "inferno-roar-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "legendary",
            "push-x"
          ],
          "range": {
            "target": "wide-line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all legal targets are Pushed to the nearest spaces outside of Inferno Roar's range.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all legal targets are Pushed to the nearest spaces outside of Inferno Roar's range.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 5300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595941455,
      "modifiedTime": 1719973447328,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Invigoration Room",
    "type": "move",
    "_id": "VMcmVoSjZaWunrhr",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "room"
      ],
      "actions": [
        {
          "name": "Invigoration Room Attack",
          "slug": "invigoration-room-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "room"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The Room is set to Invigoration Room for 3 Rounds.</p>"
        }
      ],
      "description": "<p>Effect: The Room is set to Invigoration Room for 3 Rounds.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721262653843,
      "modifiedTime": 1721262718369,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ivory Scourge",
    "type": "move",
    "_id": "eS9IDE8EeIm2CPNO",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary"
      ],
      "actions": [
        {
          "name": "Ivory Scourge Attack",
          "slug": "ivory-scourge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 12,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poisoned 5 and Enraged 5. If a creature cures the Poison Affliction before it naturally expires, it gains Blight 8.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poisoned 5 and Enraged 5. If a creature would be cured of this Poison before it naturally expires, the creature gains Blight 8.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256815450,
      "modifiedTime": 1721256938279,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Jack Knife",
    "type": "move",
    "_id": "tLShDxRaxKES6VG0",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crash-1-2",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Jack Knife Attack",
          "slug": "jack-knife-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crash-1-2",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721318524718,
      "modifiedTime": 1721318603437,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Jaunt",
    "type": "move",
    "_id": "1NJrMxc7oOky4utl",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "priority-2",
        "contact",
        "pass-4"
      ],
      "actions": [
        {
          "name": "Jaunt Attack",
          "slug": "jaunt-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "priority-2",
            "contact",
            "pass-4"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": 2,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 5400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584511636,
      "modifiedTime": 1719973509472,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Jewel Blast",
    "type": "move",
    "_id": "RQZvOPp81RJai0JQ",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Jewel Blast Attack",
          "slug": "jewel-blast-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 55,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, roll 1d8 and drop valid targets' stage of the stat in the corresponding table by -1 for 5 activations.</p><p>1- ATK, 2- DEF, 3- SPATK, 4- SPDEF, 5- SPD, 6- ACC, 7- EVA, 8- User Choice.</p>"
        }
      ],
      "description": "<p>Effect: On hit, roll 1d8 and drop valid targets' stage of the stat in the corresponding table by -1 for 5 activations.</p><p>1- ATK, 2- DEF, 3- SPATK, 4- SPDEF, 5- SPD, 6- ACC, 7- EVA, 8- User Choice.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268375498,
      "modifiedTime": 1721268590815,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Jump-Start",
    "type": "move",
    "_id": "sbMaMDyiZ2tN2uaA",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Jump-Start Attack",
          "slug": "jump-start-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies in range gain +1 SPATK and SPD stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies in range gain +1 SPATK and SPD stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 5500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742307858,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Jungle Quake",
    "type": "move",
    "_id": "V47Tq79c3PTVJSXW",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound"
      ],
      "actions": [
        {
          "name": "Jungle Quake Attack",
          "slug": "jungle-quake-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound"
          ],
          "range": {
            "target": "wide-line",
            "distance": 7,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 140,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack cannot be used on consecutive activations. On hit, all legal targets have a 10% chance of gaining Splintered 5 and a 10% chance of gaining Stuck 5.</p>"
        }
      ],
      "description": "<p>Effect: This attack cannot be used on consecutive activations. On hit, all legal targets have a 10% chance of gaining Splintered 5 and a 10% chance of gaining Stuck 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720796322531,
      "modifiedTime": 1720796851047,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Kinetic Kick",
    "type": "move",
    "_id": "fzwdqZNQWSrtaudS",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crash-1-2",
        "dash",
        "contact",
        "kick"
      ],
      "actions": [
        {
          "name": "Kinetic Kick Attack",
          "slug": "kinetic-kick-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crash-1-2",
            "dash",
            "contact",
            "kick"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721262876656,
      "modifiedTime": 1721262943042,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Kinetic Quake",
    "type": "move",
    "_id": "kAk7Qg7VDwHvpAXo",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound"
      ],
      "actions": [
        {
          "name": "Kinetic Quake Attack",
          "slug": "kinetic-quake-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound"
          ],
          "range": {
            "target": "emanation",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 11,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 75,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If a target is Burrowing, this attack ignores the target's EVA stage increases and has its Power doubled.</p>"
        }
      ],
      "description": "<p>Effect: If a target is Burrowing, this attack ignores the target's EVA stage increases and has its Power doubled.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263054843,
      "modifiedTime": 1721263132715,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Knightly Sword",
    "type": "move",
    "_id": "dSAI3ePqNamwlmbL",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "contact"
      ],
      "actions": [
        {
          "name": "Knightly Sword Attack",
          "slug": "knightly-sword-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack deals double damage against Fighting-, Normal-, and Psychic-Type creatures.</p>"
        }
      ],
      "description": "<p>Effect: This Attack deals double damage against Fighting-, Normal-, and Psychic-Type creatures.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721312560009,
      "modifiedTime": 1721312724424,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Landslide",
    "type": "move",
    "_id": "CH1OQfJifEdLanIT",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "push-2"
      ],
      "actions": [
        {
          "name": "Landslide Attack",
          "slug": "landslide-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "push-2"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799012820,
      "modifiedTime": 1720799062889,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Lariat",
    "type": "move",
    "_id": "sYIihZM4Gs3M5VBC",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "dash"
      ],
      "actions": [
        {
          "name": "Lariat Attack",
          "slug": "lariat-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "dash"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -2 ATK, SPATK, and SPD stages for 5 activations if they were in the Set-Up phase of a [Set-Up] Attack.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -2 ATK, SPATK, and SPD stages for 5 activations if they were in the Set-Up phase of a [Set-Up] Attack.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 5600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589757106,
      "modifiedTime": 1719973609144,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Lava Mine",
    "type": "move",
    "_id": "2GcEYrSYLhWw3bfL",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "hazard"
      ],
      "actions": [
        {
          "name": "Lava Mine Attack",
          "slug": "lava-mine-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "hazard"
          ],
          "range": {
            "target": "object",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user places 2 Lava Mine Hazards within Range, hiding them underground or within a wall or another thick-enough surface. When a creature moves within 2m of a lava mine, it explodes with a range of [Blast 3] and deals 5 Ticks of Fire-Type damage to all legal targets within range.</p>"
        }
      ],
      "description": "<p>Effect: The user places 2 Lava Mine Hazards within Range, hiding them underground or within a wall or another thick-enough surface. When a creature moves within 2m of a lava mine, it explodes with a range of [Blast 3] and deals 5 Ticks of Fire-Type damage to all legal targets within range.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 5700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596088511,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Legendslayer",
    "type": "move",
    "_id": "AQosin20lLDrDsLQ",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "contact"
      ],
      "actions": [
        {
          "name": "Legendslayer Attack",
          "slug": "legendslayer-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 35,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack's Power varies based on the inherent strength of the target, ranging from 35 to 150.</p><blockquote><p>Damage Formula: Power = min(150, max(35, targetBST-515) )</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This Attack's Power varies based on the inherent strength of the target, ranging from 35 to 150.</p><blockquote><p>Damage Formula: Power = min(150, max(35, targetBST-510) )</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720454527939,
      "modifiedTime": 1721445044141,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Life Draw",
    "type": "move",
    "_id": "k9VVsuQc3HRae8un",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "drain-1-4",
        "blast-3"
      ],
      "actions": [
        {
          "name": "Life Draw Attack",
          "slug": "life-draw-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "drain-1-4",
            "blast-3"
          ],
          "range": {
            "target": "blast",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 75,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 5800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584660499,
      "modifiedTime": 1719973701521,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Lightning Streak",
    "type": "move",
    "_id": "LfxTGI6lrDfKoqA4",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "crit-2"
      ],
      "actions": [
        {
          "name": "Lightning Streak Attack",
          "slug": "lightning-streak-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "crit-2"
          ],
          "range": {
            "target": "line",
            "distance": 12,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user may freely relocate themself to any open square in Range.</p>"
        }
      ],
      "description": "<p>Effect: The user may freely relocate themself to any open square in Range.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 5900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742428172,
      "modifiedTime": 1719973765655,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Link Pulse",
    "type": "move",
    "_id": "ecsVYGCN5qnPM8Iu",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse",
        "danger-close"
      ],
      "actions": [
        {
          "name": "Link Pulse Attack",
          "slug": "link-pulse-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse",
            "danger-close"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 60,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263159588,
      "modifiedTime": 1721263211386,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Lunar Ray",
    "type": "move",
    "_id": "2AkQxqOFFJefbxWZ",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "exhaust",
        "ray"
      ],
      "actions": [
        {
          "name": "Lunar Ray Attack",
          "slug": "lunar-ray-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "exhaust",
            "ray"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 150,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 6000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718737455532,
      "modifiedTime": 1720456156133,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mach Turn",
    "type": "move",
    "_id": "hkvstn0F94zVZsen",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "2-strike",
        "sonic",
        "priority-2"
      ],
      "actions": [
        {
          "name": "Mach Turn Attack",
          "slug": "mach-turn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "2-strike",
            "sonic",
            "priority-2"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": 2,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 35,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 6100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597709227,
      "modifiedTime": 1719973939629,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Maelstrom",
    "type": "move",
    "_id": "w5aW66onUyv3dtwO",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "push-x",
        "wind"
      ],
      "actions": [
        {
          "name": "Maelstrom Attack",
          "slug": "maelstrom-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "push-x",
            "wind"
          ],
          "range": {
            "target": "cone",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 10,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 120,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets are Pushed outside of the Cone area and have a 50% chance of gaining Paralyzed 7.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets are Pushed outside of the Cone area and have a 50% chance of gaining Paralyzed 7.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721318617031,
      "modifiedTime": 1721318736348,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mafic Flow",
    "type": "move",
    "_id": "OUmD7u9EfIKiVMRs",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "defrost"
      ],
      "actions": [
        {
          "name": "Mafic Flow Attack",
          "slug": "mafic-flow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "defrost"
          ],
          "range": {
            "target": "wide-line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268637787,
      "modifiedTime": 1721268686066,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Malicious Whisper",
    "type": "move",
    "_id": "XDihuolyEC4qBaTY",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social",
        "sonic"
      ],
      "actions": [
        {
          "name": "Malicious Whisper Attack",
          "slug": "malicious-whisper-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social",
            "sonic"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of being Flinched 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of being Flinched 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 13300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735336656,
      "modifiedTime": 1719973982162,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mana Burst",
    "type": "move",
    "_id": "lOAKrPYIPBjjJTaQ",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode",
        "pulse",
        "delay-2",
        "smite"
      ],
      "actions": [
        {
          "name": "Mana Burst Attack",
          "slug": "mana-burst-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode",
            "pulse",
            "delay-2",
            "smite"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 85,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 DEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 DEF stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 6200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719584791330,
      "modifiedTime": 1719974181882,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mana Cannon",
    "type": "move",
    "_id": "fAOqThi2wPLSKPY2",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-1",
        "pulse"
      ],
      "actions": [
        {
          "name": "Mana Cannon Attack",
          "slug": "mana-cannon-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-1",
            "pulse"
          ],
          "range": {
            "target": "blast",
            "distance": 12,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 105,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user has a 10% chance of increasing their SPATK stage by +1 for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user has a 10% chance of gaining +1 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 6300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1719584951214,
      "modifiedTime": 1720456239499,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mana Spear",
    "type": "move",
    "_id": "sgvceQ0swcoPD2ag",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp"
      ],
      "actions": [
        {
          "name": "Mana Spear Attack",
          "slug": "mana-spear-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 6400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585226773,
      "modifiedTime": 1719974451001,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mercurial Flow",
    "type": "move",
    "_id": "2oUQ6OU6iWiHdBU5",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Mercurial Flow Attack",
          "slug": "mercurial-flow-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poison 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poison 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313115562,
      "modifiedTime": 1721313185328,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mind Games",
    "type": "move",
    "_id": "K3uox37rgUbs2xwq",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Mind Games Attack",
          "slug": "mind-games-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "special",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -1 SPATK stages for 5 activations,  and user gains +1 SPDEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -1 SPATK stages for 5 activations,  and user gains +1 SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263231926,
      "modifiedTime": 1721269543513,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mind Shock",
    "type": "move",
    "_id": "QI1CMFWkC5SZ3mxC",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Mind Shock Attack",
          "slug": "mind-shock-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Flinched 3.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263507425,
      "modifiedTime": 1721263576043,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mirage Edge",
    "type": "move",
    "_id": "TUnhlxSbtzMAQjpF",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "crit-1",
        "priority-2"
      ],
      "actions": [
        {
          "name": "Mirage Edge Attack",
          "slug": "mirage-edge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "crit-1",
            "priority-1"
          ],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": 2,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 40 to 160.</p><blockquote><p>Damage Formula: Power = min(160, (20*UserSPD / TargetSPD) + 40)</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 40 to 160.</p><blockquote><p>Damage Formula: Power = min(160, (20*UserSPD / TargetSPD) + 40)</p></blockquote>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721310775426,
      "modifiedTime": 1721440520171,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Moisturize",
    "type": "move",
    "_id": "2C30hbu3OE6nYr4R",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Moisturize Attack",
          "slug": "moisturize-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains +1 SPDEF stage for 5 activations. The user's next damaging Water-Type attack has its Power doubled.</p>"
        }
      ],
      "description": "<p>Effect: The user gains +1 SPDEF stage for 5 activations. The user's next damaging Water-Type attack has its Power doubled.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721318805122,
      "modifiedTime": 1721318875694,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Monsoon Wind",
    "type": "move",
    "_id": "TAxtTTqno4bv6CC7",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind"
      ],
      "actions": [
        {
          "name": "Monsoon Wind Attack",
          "slug": "monsoon-wind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Paralyzed 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Paralyzed 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319433237,
      "modifiedTime": 1721319521650,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Moonbeam Lance",
    "type": "move",
    "_id": "pZnurVvpNPUCJgP2",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray",
        "contact",
        "pass-2"
      ],
      "actions": [
        {
          "name": "Moonbeam Lance Attack",
          "slug": "moonbeam-lance-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray",
            "contact",
            "pass-2"
          ],
          "range": {
            "target": "creature",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving Moonbeam Lance.</p>"
        }
      ],
      "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving Moonbeam Lance.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 6500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585443211,
      "modifiedTime": 1719974570465,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mortal Coil",
    "type": "move",
    "_id": "0T55y3gUn0wEkIxw",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Mortal Coil Attack",
          "slug": "mortal-coil-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target is Cursed, this attack's Power is doubled. A Cursed target is cured of Curse after this attack resolves.</p>"
        }
      ],
      "description": "<p>Effect: If the target is Cursed, this attack's Power is doubled. A Cursed target is cured of Curse after this attack resolves.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720461611630,
      "modifiedTime": 1720461695318,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mortal Wave",
    "type": "move",
    "_id": "grWOhLToxFZIuSkl",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-1",
        "pulse",
        "aura"
      ],
      "actions": [
        {
          "name": "Mortal Wave Attack",
          "slug": "mortal-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-1",
            "pulse",
            "aura"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 110,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: This attack is Super Effective against the Ghost Type.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721062590539,
      "modifiedTime": 1721062654334,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mow Down",
    "type": "move",
    "_id": "nOn6OXOeIUrn78xw",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "recoil-1-2",
        "dash",
        "crushing",
        "push-4",
        "contact"
      ],
      "actions": [
        {
          "name": "Mow Down Attack",
          "slug": "mow-down-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "recoil-1-2",
            "dash",
            "crushing",
            "push-4",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 150,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313199174,
      "modifiedTime": 1721313267099,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Mystic Dance",
    "type": "move",
    "_id": "U4Z383vHROMATP3C",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dance"
      ],
      "actions": [
        {
          "name": "Mystic Dance Attack",
          "slug": "mystic-dance-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dance"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user raises their SPATK and SPD stages by +1 for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user raises their SPATK and SPD stages by +1 for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721062703021,
      "modifiedTime": 1721062765406,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Nature's Chorale",
    "type": "move",
    "_id": "kcSZtxZKLGvv9E6M",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "social",
        "friendly"
      ],
      "actions": [
        {
          "name": "Nature's Chorale Attack",
          "slug": "natures-chorale-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "social",
            "friendly"
          ],
          "range": {
            "target": "wide-line",
            "distance": 7,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Unlucky 5 and a 20% chance of gaining Disabled 5 for a random attack on their Active List.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Unlucky 5 and a 20% chance of gaining Disabled 5 for a random attack on their Active List.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720796870145,
      "modifiedTime": 1720797036305,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Neurotoxin",
    "type": "move",
    "_id": "73h0Lk9HvCvqwwbc",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "grapple",
        "jaw",
        "horn"
      ],
      "actions": [
        {
          "name": "Neurotoxin Attack",
          "slug": "neurotoxin-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "grapple",
            "jaw",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 55,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 50% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 50% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721256964354,
      "modifiedTime": 1721257134890,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Neutron Pulse",
    "type": "move",
    "_id": "PLzliALNRbbd7gRN",
    "img": "systems/ptr2e/img/icons/nuclear_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse"
      ],
      "actions": [
        {
          "name": "Neutron Pulse Attack",
          "slug": "neutron-pulse-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "nuclear"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of being Poisoned 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of being Poisoned 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 6600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742528946,
      "modifiedTime": 1719974559789,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Night Chill",
    "type": "move",
    "_id": "z5BIPTJD1CAuoZlW",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Night Chill Attack",
          "slug": "night-chill-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Drowsy 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Drowsy 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812474071,
      "modifiedTime": 1720812606606,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Night Storm",
    "type": "move",
    "_id": "jcfvalGWvnCcEhgj",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind",
        "blast-3"
      ],
      "actions": [
        {
          "name": "Night Storm Attack",
          "slug": "night-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind",
            "blast-3"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of becoming Blinded 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Blinded 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 6700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718737581155,
      "modifiedTime": 1719974607390,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Noxious Acid",
    "type": "move",
    "_id": "K68tBqtac9J769mO",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2"
      ],
      "actions": [
        {
          "name": "Noxious Acid Attack",
          "slug": "noxious-acid-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2"
          ],
          "range": {
            "target": "blast",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison",
            "bug"
          ],
          "category": "special",
          "power": 65,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations. This attack is considered to be both Bug and Poison Type.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of losing -1 ACC stage for 5 activations. This attack is considered to be both Bug and Poison Type.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 12100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729744618,
      "modifiedTime": 1719974737668,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Oil Slick",
    "type": "move",
    "_id": "ql8IlRVO9PlDMP8W",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "hazard",
        "blast-4"
      ],
      "actions": [
        {
          "name": "Oil Slick Attack",
          "slug": "oil-slick-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "hazard",
            "blast-4"
          ],
          "range": {
            "target": "creature",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: An oil spill is created in the [Blast] area for 5 rounds. Any creature that starts their activation in, or enters the hazard becomes Slowed and is covered in Oil. If a creature covered in Oil attempts to use a Fire-Type move, the attack fails and they and all adjacent creature lose 4 Ticks of HP. If a creature covered in Oil is hit by a Fire-type move, they and all they and all adjacent creature lose 4 Ticks of HP.</p>"
        }
      ],
      "description": "<p>Effect: An oil spill is created in the [Blast] area for 5 rounds. Any creature that starts their activation in, or enters, the Hazard, gains Slowed 2. Any creature that ends their Activation in the Hazard is covered in Oil. If a creature covered in Oil attempts to use a Fire-Type move, the attack fails and they and all adjacent creature lose 4 Ticks of HP. If a creature covered in Oil is hit by a Fire-type move, they and all they and all adjacent creature lose 4 Ticks of HP.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721257159789,
      "modifiedTime": 1721257496122,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Omega Blast",
    "type": "move",
    "_id": "QScUWHvGnOEIlBM0",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2",
        "legendary",
        "smite",
        "pulse"
      ],
      "actions": [
        {
          "name": "Omega Blast Attack",
          "slug": "omega-blast-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2",
            "legendary",
            "smite",
            "pulse"
          ],
          "range": {
            "target": "blast",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Omega Blast uses the higher of the user's ATK or SPATK stat for damage calculation.</p>"
        }
      ],
      "description": "<p>Effect: Omega Blast uses the higher of the user's ATK or SPATK stat for damage calculation.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 6800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585561784,
      "modifiedTime": 1719974780236,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pacify",
    "type": "move",
    "_id": "tBtVuXzzJMlfmA7n",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social",
        "exhaust"
      ],
      "actions": [
        {
          "name": "Pacify Attack",
          "slug": "pacify-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -3 ATK stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -3 ATK stages for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 6900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585883093,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Paintball",
    "type": "move",
    "_id": "w5jEfRgDVYYeZLxN",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile",
        "3-strike",
        "adaptable"
      ],
      "actions": [
        {
          "name": "Paintball Attack",
          "slug": "paintball-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile",
            "3-strike",
            "adaptable"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the user has a Held Item that is associated with a specific Type, Paintball's Type changes to match that of the Held item.</p>"
        }
      ],
      "description": "<p>Effect: If the user has a Held Item that is associated with a specific Type, Paintball's Type changes to match that of the Held item.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721062787386,
      "modifiedTime": 1721062895683,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pale Mist",
    "type": "move",
    "_id": "jfXgDtwZwt2ZLg5J",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary"
      ],
      "actions": [
        {
          "name": "Pale Mist Attack",
          "slug": "pale-mist-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary"
          ],
          "range": {
            "target": "wide-line",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Frozen 5. When a target is cured of Frozen they then gain Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Frozen 5. When a target is cured of Frozen they then gain Confused 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720461747071,
      "modifiedTime": 1720462061437,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Paralytic Venom",
    "type": "move",
    "_id": "yH35AaKAFxZs5tOa",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Paralytic Venom Attack",
          "slug": "paralytic-venom-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target gains Poison 5. If the target already has Poison, it instead gains Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target gains Poison 5. If the target already has Poison or Blight, it instead gains Paralysis 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721257537086,
      "modifiedTime": 1721258533678,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Parasite Barrage",
    "type": "move",
    "_id": "N2yNROP0PHQ4Nstj",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "jaw",
        "horn"
      ],
      "actions": [
        {
          "name": "Parasite Barrage Attack",
          "slug": "parasite-barrage-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "jaw",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Leech 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Leech 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 12200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718729938664,
      "modifiedTime": 1719974846401,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Parodize",
    "type": "move",
    "_id": "Gce0Fr1xKGyBRdkP",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Parodize Attack",
          "slug": "parodize-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Roll a dX, where X is the number of Attacks in the target's Active List. The result corresponds to where the Attack is on their Active List. The user may freely use that Attack before the end of their next Activation.</p>"
        }
      ],
      "description": "<p>Effect: Select a creature on the Field. Roll a dX, where X is the number of Attacks in the target's Active List. The result corresponds to where the Attack is on their Active List (if the user gains an attack they already possess on their Active List, they roll again until they obtain an attack they do not already possess on their Active List). The user may freely use that Attack before the end of their next Activation.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 7000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718737908673,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Peaking Shriek",
    "type": "move",
    "_id": "ZlmZzhtpcuMOQBYS",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "blast-2"
      ],
      "actions": [
        {
          "name": "Peaking Shriek Attack",
          "slug": "peaking-shriek-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "blast-2"
          ],
          "range": {
            "target": "enemy",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets become Flinched 4.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets become Flinched 4.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 7100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742643707,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pepper Powder",
    "type": "move",
    "_id": "6iVjrQAsXZID7s9K",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Pepper Powder Attack",
          "slug": "pepper-powder-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "status",
          "power": null,
          "accuracy": 75,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets are Blinded 5 and lose -1 ATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets are Blinded 5 and lose -1 ATK stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720809626173,
      "modifiedTime": 1720810528494,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pestilience",
    "type": "move",
    "_id": "hRRNesI4z7E1p8Va",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2"
      ],
      "actions": [
        {
          "name": "Item Attack",
          "slug": "item-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2"
          ],
          "range": {
            "target": "blast",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "special",
          "power": 85,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Blight 8.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Blight 8.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 12300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718726964341,
      "modifiedTime": 1719974910665,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Petrified Vines",
    "type": "move",
    "_id": "ww94e1MTb1fnh1z7",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "trap",
        "legendary",
        "blast-2"
      ],
      "actions": [
        {
          "name": "Petrified Vines Attack",
          "slug": "petrified-vines-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-1",
            "trap",
            "legendary"
          ],
          "range": {
            "target": "blast",
            "distance": 9,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268747432,
      "modifiedTime": 1721268896706,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Phantom Pain",
    "type": "move",
    "_id": "qziSLv5nzIEo0OwN",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Phantom Pain Attack",
          "slug": "phantom-pain-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splintered 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splintered 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462084617,
      "modifiedTime": 1720462188482,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Piercing Drone",
    "type": "move",
    "_id": "YZ1xJ13a5aYqvill",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Piercing Drone Attack",
          "slug": "piercing-drone-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "smite"
          ],
          "range": {
            "target": "cone",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 SPATK stage for 5 Activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 SPATK stage for 5 Activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 12400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718728842633,
      "modifiedTime": 1720456269697,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pile Driver",
    "type": "move",
    "_id": "bxN5uwlrFf4dlNlj",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "crit-1",
        "crushing",
        "pierce"
      ],
      "actions": [
        {
          "name": "Pile Driver Attack",
          "slug": "pile-driver-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "crit-1",
            "crushing",
            "pierce"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 110,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313308188,
      "modifiedTime": 1721313390595,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pinpoint Edge",
    "type": "move",
    "_id": "6syusYSZ2VvCuUqG",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crit-4"
      ],
      "actions": [
        {
          "name": "Pinpoint Edge Attack",
          "slug": "pinpoint-edge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crit-4"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721268928829,
      "modifiedTime": 1721268970263,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Piston Kick",
    "type": "move",
    "_id": "Nex9bTm1YtCtfk8f",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "kick",
        "contact"
      ],
      "actions": [
        {
          "name": "Piston Kick Attack",
          "slug": "piston-kick-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "kick",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313414553,
      "modifiedTime": 1721313525923,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pixie Dust",
    "type": "move",
    "_id": "wLeuvsUwQXDH36rr",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Pixie Dust Attack",
          "slug": "pixie-dust-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, roll a d6; 1 for Burn, 2 for Poison, 3 for Paralyze, 4 for Drowsy, 5 for Frozen, and 6 for Splinter. All legal targets gain the rolled Affliction for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, roll a d6; 1 for Burn, 2 for Poison, 3 for Paralyze, 4 for Drowsy, 5 for Frozen, and 6 for Splinter. All legal targets gain the rolled Affliction for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 7200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585701550,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pixie Pummel",
    "type": "move",
    "_id": "82qZXGjkqBzey79E",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "6-strike",
        "dash",
        "priority-1"
      ],
      "actions": [
        {
          "name": "Pizxie Pummel Attack",
          "slug": "pizxie-pummel-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "6-strike",
            "dash",
            "priority-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user loses -1 DEF and SPDEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user loses -1 DEF and SPDEF stage for 5 activations.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 7300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719585983867,
      "modifiedTime": 1719975227127,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Plague Storm",
    "type": "move",
    "_id": "py0psBE5wN9cP0DN",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind"
      ],
      "actions": [
        {
          "name": "Plague Storm Attack",
          "slug": "plague-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Fear 5. If a target is Poisoned or Blighted, this attack gains [Danger Close].</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Fear 5. If a target has Poison or Blight, this attack gains [Danger Close].</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721257836473,
      "modifiedTime": 1721258501089,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Plasma Blaster",
    "type": "move",
    "_id": "snBuSorXGvmp7Dmt",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse",
        "4-strike",
        "ray"
      ],
      "actions": [
        {
          "name": "Plasma Blaster Attack",
          "slug": "plasma-blaster-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse",
            "4-strike",
            "ray"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 25,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 7400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742736048,
      "modifiedTime": 1719975355594,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Plasma Cutter",
    "type": "move",
    "_id": "I8T1hRTZgi6pmuDM",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crit-1",
        "pass-3",
        "sharp",
        "contact"
      ],
      "actions": [
        {
          "name": "Plasma Cutter Attack",
          "slug": "plasma-cutter-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crit-1",
            "pass-3",
            "sharp",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 7500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742208317,
      "modifiedTime": 1719975368381,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Polarity Flip",
    "type": "move",
    "_id": "3qrpPHRQqdC3a3JM",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "push-6",
        "delay-3"
      ],
      "actions": [
        {
          "name": "Polarity Flip Attack",
          "slug": "polarity-flip-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "push-6",
            "delay-3"
          ],
          "range": {
            "target": "cone",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel",
            "electric"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, if target is an owned Pokémon, they are immediately recalled.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721312826952,
      "modifiedTime": 1721313087318,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Power Chord",
    "type": "move",
    "_id": "w5bSm61mqcAl7r9S",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic"
      ],
      "actions": [
        {
          "name": "Power Chord Attack",
          "slug": "power-chord-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains +1 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user gains +1 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313542990,
      "modifiedTime": 1721313629917,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pressure Wave",
    "type": "move",
    "_id": "3sW2cnSDFm8C8HAF",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound",
        "priority-1",
        "pulse"
      ],
      "actions": [
        {
          "name": "Pressure Wave Attack",
          "slug": "pressure-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound",
            "priority-1",
            "pulse"
          ],
          "range": {
            "target": "cone",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799098464,
      "modifiedTime": 1720799152767,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Primordial Tail",
    "type": "move",
    "_id": "JxcfyIoGSiN0zvgh",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "tail",
        "contact"
      ],
      "actions": [
        {
          "name": "Primordial Tail Attack",
          "slug": "primordial-tail-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "tail",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 85 to 170.</p><blockquote><p>Damage Formula: Power = min(170, (15*UserSPD / TargetSPD) + 85)</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack is more powerful the faster the user is compared to the target, ranging from 85 to 170.</p><blockquote><p>Damage Formula: Power = min(170, (15*UserSPD / TargetSPD) + 85)</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269052906,
      "modifiedTime": 1721269153949,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Prismatic Laser+",
    "type": "move",
    "_id": "Aw94UJGslTkGPvJp",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray",
        "legendary",
        "4-strike"
      ],
      "actions": [
        {
          "name": "Prismatic Laser+ Attack",
          "slug": "prismatic-laser-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray",
            "legendary",
            "4-strike"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "S"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721442213461,
      "modifiedTime": 1721442466401,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Psy Dunk",
    "type": "move",
    "_id": "UYiz27ZEMBzpHvy8",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Psy Dunk Attack",
          "slug": "psy-dunk-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target becomes Grounded 5. and has a 30% chance of gaining Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target becomes Grounded 5. and has a 30% chance of gaining Flinched 3.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263591622,
      "modifiedTime": 1721263717998,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Psy Punch",
    "type": "move",
    "_id": "pgEIVBTL5eAx5f7G",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "punch",
        "contact"
      ],
      "actions": [
        {
          "name": "Psy Punch Attack",
          "slug": "psy-punch-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "punch",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "physical",
          "power": 75,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Confused 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263729913,
      "modifiedTime": 1721263802226,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pulse Charge",
    "type": "move",
    "_id": "6gJTJZOmiS0y8FHd",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse",
        "5-strike"
      ],
      "actions": [
        {
          "name": "Pulse Charge Attack",
          "slug": "pulse-charge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse",
            "5-strike"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 7600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742902901,
      "modifiedTime": 1719975431968,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Punch Rush",
    "type": "move",
    "_id": "sfnkbhDWkNgGfYEf",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "10-strike",
        "exhaust",
        "dash",
        "punch"
      ],
      "actions": [
        {
          "name": "Punch Rush Attack",
          "slug": "punch-rush-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "10-strike",
            "exhaust",
            "dash",
            "punch"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 7700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589881015,
      "modifiedTime": 1719975592358,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Punishing Flame",
    "type": "move",
    "_id": "bnB5ijY9p3JPipBS",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Punishing Flame Attack",
          "slug": "punishing-flame-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 75,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target is Burned, this attack's Power is doubled, and the target is cured of Burn on this attack's resolution.</p>"
        }
      ],
      "description": "<p>Effect: If the target is Burned, this attack's Power is doubled, and the target is cured of Burn on this attack's resolution.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 14000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718736274450,
      "modifiedTime": 1719975785638,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Purifying Wave",
    "type": "move",
    "_id": "5iJxgDIqFkuMzYB1",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "pulse"
      ],
      "actions": [
        {
          "name": "Purifying Wave Attack",
          "slug": "purifying-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "pulse"
          ],
          "range": {
            "target": "wide-line",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target has a Major Affliction, this attack's Power is doubled, and the target is cured of their Major Afflictions after this attack resolves.</p>"
        }
      ],
      "description": "<p>Effect: If the target has a Major Affliction, this attack's Power is doubled, and the target is cured of their Major Afflictions after this attack resolves.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 7800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719586367704,
      "modifiedTime": 1719976026121,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Puzzle Powder",
    "type": "move",
    "_id": "nq9qfIR9C4KZv0Pw",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Puzzle Powder Attack",
          "slug": "puzzle-powder-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "status",
          "power": null,
          "accuracy": 75,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets are Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets are Confused 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720810594560,
      "modifiedTime": 1720810655157,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Pyro Rend",
    "type": "move",
    "_id": "4ep5E76ZpTgH0XRs",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "contact",
        "crit-1"
      ],
      "actions": [
        {
          "name": "Pyro Rend Attack",
          "slug": "pyro-rend-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "contact",
            "crit-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack calculates damage against the target's SPDEF, rather than DEF.</p>"
        }
      ],
      "description": "<p>Effect: This attack calculates damage against the target's SPDEF, rather than DEF.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 7900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596241805,
      "modifiedTime": 1719976014895,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Quick Jolt",
    "type": "move",
    "_id": "3KtXoAzznZGWIlSB",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "priority-1"
      ],
      "actions": [
        {
          "name": "Quick Jolt Attack",
          "slug": "quick-jolt-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "priority-1"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": 1,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 8000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718742998677,
      "modifiedTime": 1719976057687,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Quicksand",
    "type": "move",
    "_id": "FKuHKEJmTJhtuL1P",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "hazard",
        "blast-4"
      ],
      "actions": [
        {
          "name": "Quicksand Attack",
          "slug": "quicksand-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "hazard",
            "blast-4"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: A Sand Pit is created in the [Blast] area for 5 rounds. Any creature that starts their activation in, or enters the hazard gains Slowed 2 and Stuck 2. Any creature that ends their activation in the hazard gains Bound 1.</p>"
        }
      ],
      "description": "<p>Effect: A Sand Pit is created in the [Blast] area for 5 rounds. Any creature that starts their activation in, or enters the hazard gains Slowed 2 and Stuck 2. Any creature that ends their activation in the hazard gains Bound 1.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720810777235,
      "modifiedTime": 1720810885592,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Radiant Claw",
    "type": "move",
    "_id": "ltoPWw8KlfJflb8r",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "dash",
        "contact"
      ],
      "actions": [
        {
          "name": "Radiant Claw Attack",
          "slug": "radiant-claw-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "dash",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack calculates damage against the target's SPDEF, rather than DEF.</p>"
        }
      ],
      "description": "<p>Effect: This attack calculates damage against the target's SPDEF, rather than DEF.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 8100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718740234079,
      "modifiedTime": 1719976089727,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Radiant Sphere",
    "type": "move",
    "_id": "guEsSBsoDuez4WcE",
    "img": "systems/ptr2e/img/icons/dragon_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "trap",
        "blast-2"
      ],
      "actions": [
        {
          "name": "Regal Sphere Attack",
          "slug": "regal-sphere-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "trap",
            "blast-2"
          ],
          "range": {
            "target": "blast",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dragon"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets become Bound 5. While Bound, they take a Tick of HP in damage at the end of each of their activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 8200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718739621785,
      "modifiedTime": 1719976169268,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Radioleach",
    "type": "move",
    "_id": "JQ6aGFJjij9m92yR",
    "img": "systems/ptr2e/img/icons/nuclear_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "defensive"
      ],
      "actions": [
        {
          "name": "Radioleach Attack",
          "slug": "radioleach-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "defensive"
          ],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "nuclear"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Until the end of the user's next Activation, any creature that begins or ends an activation adjacent to the user gains Poison 5. If the user hits a creature with a [Contact] attack or is hit by another creature's [Contact] attack, the other creature gains Blight 5. If the user uses the Aftermath Ability, or any Emanation [Explode] attacks, all valid targets also gain Blight 5.</p>"
        }
      ],
      "description": "<p>Effect: Until the end of the user's next Activation, any creature that begins or ends an activation adjacent to the user gains Poison 5. If the user hits a creature with a [Contact] attack or is hit by another creature's [Contact] attack, the other creature gains Blight 5. If the user uses the Aftermath Ability, or any Emanation [Explode] attacks, all valid targets also gain Blight 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721067396544,
      "modifiedTime": 1721067590563,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rainstorm Deluge",
    "type": "move",
    "_id": "Ml5gLJye2eyNlpR3",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "set-up",
        "pass-4",
        "contact",
        "pierce"
      ],
      "actions": [
        {
          "name": "Rainstorm Deluge Attack",
          "slug": "rainstorm-deluge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "set-up",
            "pass-4",
            "contact",
            "pierce"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains Invisible 1, and ends their activation. If the weather is Rainy, the user Sets-Up and resolves this attack on the same activation.</p><p>Resolution: On their next activation, the user freely moves up to two times the Movement Score of their choice and attacks with and resolves this attack.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains Invisible 1, and ends their activation. If the weather is Rainy, the user Sets-Up and resolves this attack on the same activation.</p><p>Resolution: On their next activation, the user freely moves up to two times the Movement Score of their choice and attacks with and resolves this attack.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721318930899,
      "modifiedTime": 1721319045445,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Reaper Fist",
    "type": "move",
    "_id": "EXPsyCvPmnSoG5d6",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-2",
        "punch",
        "contact"
      ],
      "actions": [
        {
          "name": "Reaper Fist Attack",
          "slug": "reaper-fist-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-2",
            "punch",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462241478,
      "modifiedTime": 1720462303523,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Recharge",
    "type": "move",
    "_id": "u8W8WBIrhmNxc2gE",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "delay-2",
        "healing"
      ],
      "actions": [
        {
          "name": "Recharge Attack",
          "slug": "recharge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "delay-2",
            "healing"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": 2,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and any allies in range heal Hit Points equal to 1/4 of their Maximum Hit Points.</p>"
        }
      ],
      "description": "<p>Effect: The user and any allies in range heal Hit Points equal to 1/4 of their Maximum Hit Points.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 8300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718743228627,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Refocus",
    "type": "move",
    "_id": "vXHw9YOGXT5ZTj7f",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Refocus Attack",
          "slug": "refocus-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains +1 ACC stages for 5 activations and cannot have their ACC reduced for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user gains +1 ACC stages for 5 activations and cannot have their ACC reduced for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721062910169,
      "modifiedTime": 1721062961916,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Refreshing Field",
    "type": "move",
    "_id": "l5t5J7P8xrdXelEJ",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "room"
      ],
      "actions": [
        {
          "name": "Refreshing Field Attack",
          "slug": "refreshing-field-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The Room is set to Refreshing Field for 3 Rounds.</p>"
        }
      ],
      "description": "<p>Effect: The Room is set to Refreshing Field for 3 Rounds.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721262758252,
      "modifiedTime": 1721262859092,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rending Strip",
    "type": "move",
    "_id": "16e0RETsjFtwRwKi",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Rending Strip Attack",
          "slug": "rending-strip-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Splinter 5. This attack is Super Effective against the Steel Type.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Splinter 5. This attack is Super Effective against the Steel Type.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269171145,
      "modifiedTime": 1721269250977,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Restrain",
    "type": "move",
    "_id": "wsr18311AEbEQmhl",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "grapple"
      ],
      "actions": [
        {
          "name": "Restrain Attack",
          "slug": "restrain-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "grapple"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 15,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user auto-succeeds on a Grapple Maneuver check against the target if Restrain hits. The Target becomes Bound 5. While the target is Bound, they take a Tick of HP damage at the end of each of their activations.</p><p>If either the Grappled or Bound condition ends, the target loses the other condition.</p>"
        }
      ],
      "description": "<p>Effect: The user auto-succeeds on a Grapple Maneuver check against the target if Restrain hits. The Target becomes Bound 5. While the target is Bound, they take a Tick of HP damage at the end of each of their activations.</p><p>If either the Grappled or Bound condition ends, the target loses the other condition.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 8400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738410643,
      "modifiedTime": 1719976220955,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Retribution",
    "type": "move",
    "_id": "9WEyAgFumkMi9nid",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Retribution Attack",
          "slug": "retribution-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack's Power increases by 50 for every allied creature that has Fainted this battle, up to a maximum power of 200.</p>"
        }
      ],
      "description": "<p>Effect: This Attack's Power increases by 50 for every allied creature that has Fainted this battle, up to a maximum power of 200.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 8500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587227483,
      "modifiedTime": 1719976260459,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Reverb Room",
    "type": "move",
    "_id": "Pean4eEUQ6jpwtmz",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "room"
      ],
      "actions": [
        {
          "name": "Reverb Room Attack",
          "slug": "reverb-room-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "room"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The Room is set to Reverb Room for 3 Rounds.</p>"
        }
      ],
      "description": "<p>Effect: The Room is set to Reverb Room for 3 Rounds.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263894759,
      "modifiedTime": 1721263927099,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Riposte",
    "type": "move",
    "_id": "1QT2lxqZsmSnywPd",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "dash",
        "interrupt-1",
        "contact"
      ],
      "actions": [
        {
          "name": "Riposte Attack",
          "slug": "riposte-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "dash",
            "interrupt-1",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": "You are targeted by a Physical- or Special-Category Attack."
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Trigger: You are targeted by a Physical- or Special-Category Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with this Attack. If the target Faints due to damage from this Attack, the triggering attack fails.</p>"
        }
      ],
      "description": "<p>Trigger: You are targeted by a Physical- or Special-Category Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with this Attack. If the target Faints due to damage from this Attack, the triggering attack fails.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269262041,
      "modifiedTime": 1721269365815,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Riptide",
    "type": "move",
    "_id": "FhCMSMzvulFPkfJD",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "push-3"
      ],
      "actions": [
        {
          "name": "Riptide Attack",
          "slug": "riptide-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "push-3"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319073244,
      "modifiedTime": 1721319143035,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Roaring Strike",
    "type": "move",
    "_id": "E4boK3rCIOnLkfFV",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "dash"
      ],
      "actions": [
        {
          "name": "Roaring Strike Attack",
          "slug": "roaring-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "dash"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 85,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of becoming Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of becoming Flinched 3.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 8600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718743106519,
      "modifiedTime": 1719976335528,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rockdust",
    "type": "move",
    "_id": "ZGO02pAKs4BGdUtH",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Rockdust Attack",
          "slug": "rockdust-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 ACC stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of losing -1 ACC stage for 5 activations.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269420327,
      "modifiedTime": 1721269469495,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rocket Kick",
    "type": "move",
    "_id": "IjSCmFpB2odL17UL",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "2-strike",
        "kick",
        "contact"
      ],
      "actions": [
        {
          "name": "Rocket Kick Attack",
          "slug": "rocket-kick-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "2-strike",
            "kick",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 30,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 8700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596498632,
      "modifiedTime": 1719977057481,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rocky Rebuff",
    "type": "move",
    "_id": "hBXyr28hEfRL3VQC",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Rocky Rebuff Attack",
          "slug": "rocky-rebuff-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -1 ATK stages for 5 activations, and user gains +1 DEF stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -1 ATK stages for 5 activations, and user gains +1 DEF stage for 5 activations.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269490476,
      "modifiedTime": 1721269589459,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rose Spear",
    "type": "move",
    "_id": "ZnMDwyqiWmWZQFvk",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Rose Spear Attack",
          "slug": "rose-spear-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving this attack.</p>"
        }
      ],
      "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving this attack.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720797064755,
      "modifiedTime": 1720797297705,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rot Cloud",
    "type": "move",
    "_id": "Hm7TcVFbJ7VxDo4O",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-3"
      ],
      "actions": [
        {
          "name": "Rot Cloud Attack",
          "slug": "rot-cloud-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-3"
          ],
          "range": {
            "target": "blast",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "special",
          "power": 95,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Poison 5 and a 10% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Poison 5 and a 10% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721258573940,
      "modifiedTime": 1721259008066,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Ruby Beam",
    "type": "move",
    "_id": "6yO14dd1qO7r9EFC",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Ruby Beam Attack",
          "slug": "ruby-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Burn 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Burn 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269729006,
      "modifiedTime": 1721269898261,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rug Pull",
    "type": "move",
    "_id": "Q26ZVVsWuTOx5PG2",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Rug Pull Attack",
          "slug": "rug-pull-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack's Power is based on how heavy the target is, ranging from 20 to 140.</p><blockquote><p>Damage Formula: Power = max(140, min(20, TargetWC x 10)))</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack's Power is based on how heavy the target is, ranging from 20 to 140.</p><blockquote><p>Damage Formula: Power = max(140, min(20, TargetWC x 10)))</p></blockquote>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 8800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738545475,
      "modifiedTime": 1719977396286,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rune Ray",
    "type": "move",
    "_id": "QMFdsFyybf4DoOsU",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray",
        "blast-3",
        "delay-2"
      ],
      "actions": [
        {
          "name": "Rune Ray Attack",
          "slug": "rune-ray-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray",
            "blast-3",
            "delay-2"
          ],
          "range": {
            "target": "creature",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 12,
            "delay": 2,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is treated as being super-effective against the target, and doubly super-effective if the target possesses at least 2 Types.</p>"
        }
      ],
      "description": "<p>Effect: This attack's Type is set to all of the user's current Types.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721063016231,
      "modifiedTime": 1721066408107,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Rust Breath",
    "type": "move",
    "_id": "QWMbQoEQBDutGn3c",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Rust Breath Attack",
          "slug": "rust-breath-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poisoned 5 and a 30% chance of losing -1 SPDEF stage for 5 Activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Poisoned 5 and a 30% chance of losing -1 SPDEF stage for 5 Activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313645524,
      "modifiedTime": 1721313832740,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sacrificial Blessing",
    "type": "move",
    "_id": "ZDabtfdUA1hRhXCW",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "healing",
        "delay-3"
      ],
      "actions": [
        {
          "name": "Sacrificial Blessing Attack",
          "slug": "sacrificial-blessing-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "healing",
            "delay-3"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": 3,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user reduces their HP to 0 and Faints. After the user Faints, the Target recovers all of its HP and PP, and is cured of all Status Afflictions. If the user is an owned Pokémon and their Trainer has another Pokémon that is not Fainted in a Poke Ball, that Pokémon may be designated the target of this Attack, so long as the Trainer is within range.</p>"
        }
      ],
      "description": "<p>Effect: The user reduces their HP to 0 and Faints. After the user Faints, the Target recovers all of its HP and PP, and is cured of all Status Afflictions. If the user is an owned Pokémon and their Trainer has another Pokémon that is not Fainted in a Poke Ball, that Pokémon may be designated the target of this Attack, so long as the Trainer is within range.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 8900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719586510433,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sand Grind",
    "type": "move",
    "_id": "CFIHdDLed2iWVQmx",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Sand Grind Attack",
          "slug": "sand-grind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If the target's current Hit Points are less than 50% of their Max, this Attack's Power is doubled.</p>"
        }
      ],
      "description": "<p>Effect: If the target's current Hit Points are less than 50% of their Max, this Attack's Power is doubled.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799181706,
      "modifiedTime": 1720799235861,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sand Plume",
    "type": "move",
    "_id": "olp12PcGTJlJzc78",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Sand Plume Attack",
          "slug": "sand-plume-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799248198,
      "modifiedTime": 1720799317537,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sand Shot",
    "type": "move",
    "_id": "wwcctboD300RrQhc",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile",
        "basic"
      ],
      "actions": [
        {
          "name": "Sand Shot Attack",
          "slug": "sand-shot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile",
            "basic"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799331627,
      "modifiedTime": 1720799433698,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sand Wave",
    "type": "move",
    "_id": "YcF1tiezgZgx0ryl",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Sand Wave Attack",
          "slug": "sand-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "wide-line",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: The user may freely relocate themself to any open square in Range. This Attack's Power is doubled against Burrowed targets.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799494011,
      "modifiedTime": 1720799667142,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sandblast",
    "type": "move",
    "_id": "MpGQ33UArWUzZgfb",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Sandblast Attack",
          "slug": "sandblast-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: This Attack's Power is doubled if the target is afflicted with Splinter.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799686160,
      "modifiedTime": 1720799792704,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sandtrap",
    "type": "move",
    "_id": "2rktRS5pOJDKLPtZ",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "defensive",
        "environ"
      ],
      "actions": [
        {
          "name": "Sandtrap Attack",
          "slug": "sandtrap-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "defensive"
          ],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 140,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user is surrounded in falling sand, gaining Braced 1 and gains +1 DEF, SPDEF, and EVA stages for 3 activations. If the weather is Dusty, the user Sets-Up and resolves Sand's of Time on the same activation.</p><p>Resolution: On their next activation, they attack with and resolve this attack. If the weather is not Dusty, Windy, or Clear, this attack's Power is reduced by 50%.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user is surrounded in falling sand, gaining Braced 1 and gains +1 DEF, SPDEF, and EVA stages for 3 activations. If the weather is Dusty, the user Sets-Up and resolves Sand's of Time on the same activation.</p><p>Resolution: On their next activation, they attack with and resolve this attack. If the weather is not Dusty, Windy, or Clear, this attack's Power is reduced by 50%.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799892120,
      "modifiedTime": 1720800029573,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sapphire Beam",
    "type": "move",
    "_id": "94IUhgoRIBpG2Ci8",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Sapphire Beam Attack",
          "slug": "sapphire-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "wide-line",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Frozen 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Frozen 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269922395,
      "modifiedTime": 1721269958835,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Saw Blade",
    "type": "move",
    "_id": "3shXx43N4Lh4bsAv",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sharp",
        "crit-1",
        "pass-2",
        "contact"
      ],
      "actions": [
        {
          "name": "Saw Blade Attack",
          "slug": "saw-blade-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sharp",
            "crit-1",
            "pass-2",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721313852048,
      "modifiedTime": 1721313918885,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Schadenfreude",
    "type": "move",
    "_id": "SoCoMVFFppjfZXj2",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "social"
      ],
      "actions": [
        {
          "name": "Schadenfreude Attack",
          "slug": "schadenfreude-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "social"
          ],
          "range": {
            "target": "cone",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -1 SPDEF stages for 5 activations, and the user increases their SPATK by +1 stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -1 SPDEF stages for 5 activations, and the user increases their SPATK by +1 stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 9000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738158953,
      "modifiedTime": 1719976365950,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Scirocco",
    "type": "move",
    "_id": "KklaeGDK9efiMyQH",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sky",
        "wind",
        "environ"
      ],
      "actions": [
        {
          "name": "Scirocco Attack",
          "slug": "scirocco-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sky",
            "wind",
            "environ"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splintered 5. If Dusty Weather is active, this attack gains [Danger Close]. </p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Splintered 5. If Dusty Weather is active, this attack gains [Danger Close]. </p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720799981962,
      "modifiedTime": 1720800164463,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Scorched Earth",
    "type": "move",
    "_id": "OnCQoc5p4Jou9B8j",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "environ",
        "earthbound"
      ],
      "actions": [
        {
          "name": "Scorched Earth Attack",
          "slug": "scorched-earth-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "environ",
            "earthbound"
          ],
          "range": {
            "target": "cone",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: If Scorched Terrain is active, this Attack's range changes to \"Wide Line 5.\"</p>"
        }
      ],
      "description": "<p>Effect: If Scorched Terrain is active, this Attack's range changes to \"Wide Line 5.\"</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 9100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596666337,
      "modifiedTime": 1719977546398,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Scorched Terrain",
    "type": "move",
    "_id": "yTJz4NC7QFi2fl4j",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "terrain"
      ],
      "actions": [
        {
          "name": "Scorched Terrain Attack",
          "slug": "scorched-terrain-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "terrain"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The Terrain is set to Scorched Terrain for 3 rounds.</p>"
        }
      ],
      "description": "<p>Effect: The Terrain is set to Scorched Terrain for 3 rounds.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 9200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719595215023,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sea Shanty",
    "type": "move",
    "_id": "EFO2ENjeCTdR4l51",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "social",
        "friendly"
      ],
      "actions": [
        {
          "name": "Sea Shanty Attack",
          "slug": "sea-shanty-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "social",
            "friendly"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Taunted 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 20% chance of gaining Taunted 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319183840,
      "modifiedTime": 1721319404061,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sediment Smother",
    "type": "move",
    "_id": "UQgPZl6MhCinecLA",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Sediment Smother Attack",
          "slug": "sediment-smother-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "wide-line",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721269981433,
      "modifiedTime": 1721270038899,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Seeking Spectre",
    "type": "move",
    "_id": "0huMdAh43CspM6Hw",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "missile",
        "legendary"
      ],
      "actions": [
        {
          "name": "Seeking Spectre Attack",
          "slug": "seeking-spectre-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "missile",
            "legendary"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user can spend 3 additional PP to use this attack as an [Interrupt 6] action, with the Trigger being \"A creature uses Movement to move 4m or more away from the user or is being Switched out\". Upon declaring this attack with this Trigger, the user can freely move up to half of the Movement Type of their choice towards the target and then attacks with this attack, which has its Power doubled.</p>"
        }
      ],
      "description": "<p>Effect: The user can spend 3 additional PP to use this attack as an [Interrupt 6] action, with the Trigger being \"A creature uses Movement to move 4m or more away from the user or is being Switched out\". Upon declaring this attack with this Trigger, the user can freely move up to half of the Movement Type of their choice towards the target and then attacks with this attack, which has its Power doubled.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462319004,
      "modifiedTime": 1720462471623,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shell Shock",
    "type": "move",
    "_id": "pittprd1e3TajcRB",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode",
        "sonic",
        "blast-2"
      ],
      "actions": [
        {
          "name": "Shell Shock Attack",
          "slug": "shell-shock-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode",
            "sonic",
            "blast-2"
          ],
          "range": {
            "target": "blast",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Confused 5 and Hindered 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of gaining Confused 5 and Hindered 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314058382,
      "modifiedTime": 1721314147449,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shimmer",
    "type": "move",
    "_id": "d2pqGaOH5ngClI3i",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "basic"
      ],
      "actions": [
        {
          "name": "Shimmer Attack",
          "slug": "shimmer-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "basic"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 30,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is Super Effective against the Ghost Type.</p>"
        }
      ],
      "description": "<p>Effect: This attack is Super Effective against the Ghost Type.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721063781486,
      "modifiedTime": 1721063852478,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shiver",
    "type": "move",
    "_id": "6x7UgbfG7pwicnVJ",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Shiver Attack",
          "slug": "shiver-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "emanation",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "status",
          "power": null,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -2 SPD stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -2 SPD stages for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812653050,
      "modifiedTime": 1720812737174,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shock Wall",
    "type": "move",
    "_id": "pVpS1fw865izPLlH",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "hazard"
      ],
      "actions": [
        {
          "name": "Shock Wall Attack",
          "slug": "shock-wall-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "hazard"
          ],
          "range": {
            "target": "line",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: An electrical wall of energy is spread out across range template, 3m tall. A creature that starts an Activation in a space contraining a Shock Wall [Hazard], gains Paralysis 3. A creature that moves Overland through the Hazard gains Paralysis 1 for each square traveled. Electric-Type creatures can freely pass through the Hazard, gaining a Tick of Hit Points when doing so.</p>"
        }
      ],
      "description": "<p>Effect: An electrical wall of energy is spread out across the range template, 3m tall. A creature that starts an Activation in a space contraining a Shock Wall [Hazard], gains Paralysis 3. A creature that moves Overland through the Hazard gains Paralysis 1 for each square traveled. Electric-Type creatures can freely pass through the Hazard, gaining a Tick of Hit Points when doing so.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 9300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718743331595,
      "modifiedTime": 1721255916242,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shocking Cascade",
    "type": "move",
    "_id": "YDEotKbnmF7UPix9",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "5-strike",
        "pulse",
        "recoil-1-4"
      ],
      "actions": [
        {
          "name": "Shocking Cascade Attack",
          "slug": "shocking-cascade-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "5-strike",
            "pulse",
            "recoil-1-4"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 40,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 9400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718743964545,
      "modifiedTime": 1719977611222,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Shrapnel Shot",
    "type": "move",
    "_id": "LbqvBrCjr8OhQC0d",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Shrapnel Shot Attack",
          "slug": "shrapnel-shot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "physical",
          "power": 45,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 50% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 50% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314177990,
      "modifiedTime": 1721314241125,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sigma Wind",
    "type": "move",
    "_id": "BnaI29Q8WakCGGh9",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sky",
        "wind",
        "legendary"
      ],
      "actions": [
        {
          "name": "Sigma Wind Attack",
          "slug": "sigma-wind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sky",
            "wind",
            "legendary"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target gains Grounded 5 and has a 20% chance of gaining Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target gains Grounded 5 and has a 20% chance of gaining Paralysis 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 9500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719598129939,
      "modifiedTime": 1719977826694,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Silver Shot",
    "type": "move",
    "_id": "psNCkVvsU8Kn76sE",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile",
        "crit-1"
      ],
      "actions": [
        {
          "name": "Silver Shot Attack",
          "slug": "silver-shot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile",
            "crit-1"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 20% chance of gaining Splinter 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 20% chance of gaining Splinter 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721270056253,
      "modifiedTime": 1721270108791,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Slumber Fang",
    "type": "move",
    "_id": "GmJYEzL7zbGEuieR",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "jaw",
        "contact"
      ],
      "actions": [
        {
          "name": "Slumber Fang Attack",
          "slug": "slumber-fang-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "jaw",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target gains Drowsy 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target gains Drowsy 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259027588,
      "modifiedTime": 1721259759481,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Snapshot",
    "type": "move",
    "_id": "HQhJ9ok50osNpbD4",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Snapshot Attack",
          "slug": "snapshot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user copies all valid targets' current stat changes, adding and reducing the net stat changes accordingly, for 5 Activations. Each target then has their ACC reduced by -1 stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user copies all valid targets' current stat changes, adding and reducing the net stat changes accordingly, for 5 Activations. Each target then has their ACC reduced by -1 stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721263948203,
      "modifiedTime": 1721264029157,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sneak Attack",
    "type": "move",
    "_id": "FFywXU5xLqmapUrV",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "priority-1",
        "contact",
        "crit-1"
      ],
      "actions": [
        {
          "name": "Sneak Attack Attack",
          "slug": "sneak-attack-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "priority-1",
            "contact",
            "crit-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 9600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738702064,
      "modifiedTime": 1719977851101,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Snow Cannon",
    "type": "move",
    "_id": "4J9L5J7r8VE3pu9C",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-3",
        "missile"
      ],
      "actions": [
        {
          "name": "Snow Cannon Attack",
          "slug": "snow-cannon-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-3",
            "missile"
          ],
          "range": {
            "target": "blast",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 75,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Flinched 3.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720812761112,
      "modifiedTime": 1720812972537,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Snow Throw",
    "type": "move",
    "_id": "uKc3XUlh1TYFKWEv",
    "img": "systems/ptr2e/img/icons/ice_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Snow Throw Attack",
          "slug": "snow-throw-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ice"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target's equipped Held item is knocked onto the ground in a space adjacent to the target.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target's equipped Held item is knocked onto the ground in a space adjacent to the target.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720813051363,
      "modifiedTime": 1720813123377,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Soaring Row",
    "type": "move",
    "_id": "IuqYfz8lt2DeUPRM",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "pass-2",
        "delay-1"
      ],
      "actions": [
        {
          "name": "Soaring Row Attack",
          "slug": "soaring-row-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "pass-2",
            "delay-1"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user may freely move up to twice their Flight Score into the air upon declaring this attack. If the target is in the Set-Up phase of Bounce, Fly, Sky Attack, or Sky Drop then this attack gains [Danger Close]. The user does not take damage from falling until their next Activation.</p>"
        }
      ],
      "description": "<p>Effect: The user may freely move up to twice their Flight Score into the air upon declaring this attack. If the target is in the Set-Up phase of Bounce, Fly, Sky Attack, or Sky Drop then this attack gains [Danger Close]. The user does not take damage from falling until their next Activation.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 9700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719597833041,
      "modifiedTime": 1719977944415,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sonic Cannon",
    "type": "move",
    "_id": "ikioNSbeHgwkfu5c",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "pulse"
      ],
      "actions": [
        {
          "name": "Sonic Cannon Attack",
          "slug": "sonic-cannon-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "pulse"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of gaining Flinched 2.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of gaining Flinched 2.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721065193600,
      "modifiedTime": 1721065395760,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sorrowful Strike",
    "type": "move",
    "_id": "kN9sCA4TVMSGljkp",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Sorrowful Strike Attack",
          "slug": "sorrowful-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack's Power increases by 50 for every allied creature that has Fainted this battle, up to a maximum power of 200.</p>"
        }
      ],
      "description": "<p>Effect: This Attack's Power increases by 50 for every allied creature that has Fainted this battle, up to a maximum power of 200.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 9800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719589987192,
      "modifiedTime": 1719977998962,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Soul Scourge",
    "type": "move",
    "_id": "id8DvKZ2v2bOK2oO",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "recoil-1-3",
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Soul Scourge Attack",
          "slug": "soul-scourge-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "recoil-1-3",
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462492410,
      "modifiedTime": 1720462578187,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Soul Storm",
    "type": "move",
    "_id": "yvtAuSFDqeuhhp3Z",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sky",
        "environ"
      ],
      "actions": [
        {
          "name": "Soul Storm Attack",
          "slug": "soul-storm-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sky",
            "environ"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 110,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Cursed 5. If Gloomy Weather is active, this attack gains [Danger Close]. </p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Cursed 5. If Gloomy Weather is active, this attack gains [Danger Close]. </p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462600172,
      "modifiedTime": 1720462708805,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Soul Sucker",
    "type": "move",
    "_id": "MZw4I5yGOoNyEzAM",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-2"
      ],
      "actions": [
        {
          "name": "Soul Sucker Attack",
          "slug": "soul-sucker-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-2"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost",
            "untyped"
          ],
          "category": "special",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462741642,
      "modifiedTime": 1720462849643,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spectral Darts",
    "type": "move",
    "_id": "XzOURs5uBA6Uf6Pu",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile",
        "danger-close"
      ],
      "actions": [
        {
          "name": "Spectral Darts Attack",
          "slug": "spectral-darts-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile",
            "danger-close"
          ],
          "range": {
            "target": "creature",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 60,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462877138,
      "modifiedTime": 1720462964654,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spectral Spiral",
    "type": "move",
    "_id": "E79BUpXAsbuMc4gX",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "crit-3",
        "wind"
      ],
      "actions": [
        {
          "name": "Spectral Spiral Attack",
          "slug": "spectral-spiral-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "crit-3",
            "wind"
          ],
          "range": {
            "target": "wide-line",
            "distance": 15,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720462981360,
      "modifiedTime": 1720463224719,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spellbind",
    "type": "move",
    "_id": "0ODL9uCw44Tre4AX",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Spellbind Attack",
          "slug": "spellbind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 30% chance of inflicting Disabled 5 on the last attack the target used.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 30% chance of inflicting Disabled 5 on the last attack the target used.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 9900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719586659222,
      "modifiedTime": 1719978049726,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spike Bomb",
    "type": "move",
    "_id": "SQrVjQkQpRh2E7gD",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-2",
        "explode",
        "hazard"
      ],
      "actions": [
        {
          "name": "Spike Bomb Attack",
          "slug": "spike-bomb-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-2",
            "explode",
            "hazard"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 75,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user freely uses Spikes, centered on the center of this attack's [Blast].</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user freely uses Spikes, centered on the center of this attack's [Blast].</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721065480816,
      "modifiedTime": 1721065557219,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spine Dart",
    "type": "move",
    "_id": "6jtlvFgpTtlM1HzN",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Spine Dart Attack",
          "slug": "spine-dart-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the next Physical- or Special-Category attack the target uses gains [Recoil 1/3] (if the attack already had [Recoil X], it instead gains [Recoil 3/4]) until after the attack resolves.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the next Physical- or Special-Category attack the target uses gains [Recoil 1/3] (if the attack already had [Recoil X], it instead gains [Recoil 3/4]) until after the attack resolves.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259305637,
      "modifiedTime": 1721259767410,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spirit Bond",
    "type": "move",
    "_id": "JzeHetwQ7Uvqw1TA",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "social"
      ],
      "actions": [
        {
          "name": "Spirit Bond Attack",
          "slug": "spirit-bond-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "enemy",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "simple",
            "powerPoints": 0,
            "delay": null,
            "priority": null
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null
        }
      ],
      "description": "<p>Effect: The target gains Taunted 5 and Cursed 5. While afflicted with these Condtions, the target's Attacks that target the user gain [Recoil 1].</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720808684075,
      "modifiedTime": 1720808912209,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Spirit Punch",
    "type": "move",
    "_id": "rICZRhiMnJwV1eYJ",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "aura",
        "punch",
        "contact"
      ],
      "actions": [
        {
          "name": "Spirit Punch Attack",
          "slug": "spirit-punch-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "aura",
            "punch",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "special",
          "power": 80,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack uses the target's SPDEF in calculating damage, rather than their DEF. This attack deals neutral damage against the Ghost Type.</p>"
        }
      ],
      "description": "<p>Effect: This Attack uses the target's SPDEF in calculating damage, rather than their DEF. This attack deals neutral damage against the Ghost Type.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 10000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719590037899,
      "modifiedTime": 1719978078783,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Star Beam",
    "type": "move",
    "_id": "uwkwLU9GN0DNeRHK",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Star Beam Attack",
          "slug": "star-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "wide-line",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic",
            "fairy"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user loses -2 SPATK stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -2 SPATK stages for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721264045448,
      "modifiedTime": 1721264145737,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Static Strike",
    "type": "move",
    "_id": "ekwdakVALv3cLVfG",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "contact",
        "environ"
      ],
      "actions": [
        {
          "name": "Static Strike Attack",
          "slug": "static-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "contact",
            "environ"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 80,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Electric Terrain or Rainy Weather, they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolve this attack. On hit, the target gains Paralysis 5.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Electric Terrain or Rainy Weather, they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolve this attack. On hit, the target gains Paralysis 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 10100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718743519730,
      "modifiedTime": 1719978166126,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sticky Fingers",
    "type": "move",
    "_id": "ghEtV0n5xHUOWaLh",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact"
      ],
      "actions": [
        {
          "name": "Sticky Fingers Attack",
          "slug": "sticky-fingers-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user steals the target's equipped Acessory item or one Belt item and equips it to itself. If the user already has an equipped Accessory or Belt item, the stolen item is dropped on the ground in a square adjacent to the target.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user steals the target's equipped Acessory item or one Belt item and equips it to itself. If the user already has an equipped Accessory or Belt item, the stolen item is dropped on the ground in a square adjacent to the target.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721065582491,
      "modifiedTime": 1721065661179,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Sting Lance",
    "type": "move",
    "_id": "VN3g6tbjYdytF1kK",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "pass-3",
        "dash",
        "horn"
      ],
      "actions": [
        {
          "name": "Sting Lance Attack",
          "slug": "sting-lance-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "pass-3",
            "dash",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "physical",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving Sting Lance.</p>"
        }
      ],
      "description": "<p>Effect: The user ignores [Defensive] effects and stage changes the target has when attacking with and resolving Sting Lance.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 12500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718730077369,
      "modifiedTime": 1719978309390,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Strangle Thorns",
    "type": "move",
    "_id": "Ve9CuoGypHcQh5Ht",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "blast-5",
        "legendary"
      ],
      "actions": [
        {
          "name": "Strangle Thorns Attack",
          "slug": "strangle-thorns-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "blast-5",
            "legendary"
          ],
          "range": {
            "target": "blast",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets are Bound 5 and have a 50% chance of gaining Splintered 7.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets are Bound 5 and have a 50% chance of gaining Splintered 7.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720797327879,
      "modifiedTime": 1720797493743,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Superspread",
    "type": "move",
    "_id": "41vylq9fiaBko12z",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "powder"
      ],
      "actions": [
        {
          "name": "Superspread Attack",
          "slug": "superspread-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "powder"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poisoned 5 and having their SPDEF decreased by -1 for 5 activations. The user gains Choice-Locked 3. While Choice-Locked, the user does not consume PP. Each successive use of this attack increases its effect chance by a flat 10%, and the effect chance is reset to 10% if it misses or there is not a valid target.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poisoned 5 and having their SPDEF decreased by -1 for 5 activations. The user gains Choice-Locked 3. While Choice-Locked, the user does not consume PP. Each successive use of this attack increases its effect chance by a flat 10%, and the effect chance is reset to 10% if it misses or there is not a valid target.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259496619,
      "modifiedTime": 1721259585209,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tainted Earth",
    "type": "move",
    "_id": "x2nRF7xVu8qO2VId",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound"
      ],
      "actions": [
        {
          "name": "Tainted Earth Attack",
          "slug": "tainted-earth-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground",
            "nuclear"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720800270068,
      "modifiedTime": 1720800371380,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Talon Raze",
    "type": "move",
    "_id": "yUPs9aZmnrM9gDSY",
    "img": "systems/ptr2e/img/icons/fighting_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "sharp",
        "contact",
        "3-strike"
      ],
      "actions": [
        {
          "name": "Talon Raze Attack",
          "slug": "talon-raze-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "sharp",
            "contact",
            "3-strike"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 0,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fighting"
          ],
          "category": "physical",
          "power": 50,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user loses -1 ATK and SPD stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -1 ATK and SPD stages for 5 activations.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 10200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719588567924,
      "modifiedTime": 1719978244534,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tear Down",
    "type": "move",
    "_id": "XEio4JvEdj5z5yKC",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "delay-2"
      ],
      "actions": [
        {
          "name": "Tear Down Attack",
          "slug": "tear-down-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "delay-2"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": 2,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target's [Shield] effects are removed.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target's [Shield] effects are removed.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 10300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738841156,
      "modifiedTime": 1719978298816,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tetra Guard",
    "type": "move",
    "_id": "htfMUtAGxru3tavj",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "shield",
        "defensive"
      ],
      "actions": [
        {
          "name": "Tetra Guard Attack",
          "slug": "tetra-guard-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "shield",
            "defensive"
          ],
          "range": {
            "target": "emanation",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user and all allies take 50% less damage from Grass, Fire, Water and Electric Type-attacks for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: The user and all allies take 50% less damage from Grass, Fire, Water and Electric Type-attacks for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721065694411,
      "modifiedTime": 1721065896382,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Thunder Crash",
    "type": "move",
    "_id": "eMaFTRVbnK6BFVhh",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pass-5",
        "delay-1",
        "contact"
      ],
      "actions": [
        {
          "name": "Thunder Crash Attack",
          "slug": "thunder-crash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pass-5",
            "delay-1",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": 1,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 130,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On resolution, the user loses -2 ATK stages for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -2 ATK stages for 5 activations.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 10400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1718743677752,
      "modifiedTime": 1720456352677,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Thunder Hammer",
    "type": "move",
    "_id": "VZGkTIz8AkdtTCQn",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "crushing"
      ],
      "actions": [
        {
          "name": "Thunder Hammer Attack",
          "slug": "thunder-hammer-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "crushing"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 75,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 10500000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718743803945,
      "modifiedTime": 1719978471292,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Thunder Tail",
    "type": "move",
    "_id": "FRFtOtq5NKcAR441",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "tail",
        "contact"
      ],
      "actions": [
        {
          "name": "Thunder Tail Attack",
          "slug": "thunder-tail-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "tail",
            "contact"
          ],
          "range": {
            "target": "cone",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "physical",
          "power": 90,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Dazzled 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Dazzled 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 10600000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718744111350,
      "modifiedTime": 1719978559618,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Time Out",
    "type": "move",
    "_id": "es8rozAC9teyjDOV",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "legendary",
        "defensive",
        "interrupt-3",
        "set-up",
        "delay-3"
      ],
      "actions": [
        {
          "name": "Time Out Attack",
          "slug": "time-out-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "legendary",
            "defensive",
            "interrupt-3",
            "set-up",
            "delay-3"
          ],
          "range": {
            "target": "emanation",
            "distance": 7,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": 3,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "status",
          "power": null,
          "accuracy": 80,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user gains Braced 2. If the user is hit by a Physical or Special-Category Attack before their next Activation, they may resolve this attack as an Interrupt.</p><p>Resolution: On hit, all legal targets gain Suppressed 5, Hindered 5, Unlucky 5, Disabled 5, and Nullified 5 (the latter two decided randomly).</p>"
        }
      ],
      "description": "<p>Effect: The user gains Braced 2. If the user is hit by a Physical or Special-Category Attack before their next Activation, they may resolve this attack as an Interrupt.</p><p>Resolution: On hit, all legal targets gain Suppressed 5, Hindered 5, Unlucky 5, Disabled 5, and Nullified 5 (the latter two decided randomly).</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721065867703,
      "modifiedTime": 1721066239910,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Topple",
    "type": "move",
    "_id": "Kq5BMi4x8eMUIXcw",
    "img": "systems/ptr2e/img/icons/rock_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Topple Attack",
          "slug": "topple-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "rock",
            "psychic"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721270181687,
      "modifiedTime": 1721270242317,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Toxicrash",
    "type": "move",
    "_id": "OR1xXtygDIWtG3c4",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "dash",
        "pass-1",
        "recoil-1-3"
      ],
      "actions": [
        {
          "name": "Toxicrash Attack",
          "slug": "toxicrash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "dash",
            "pass-1",
            "recoil-1-3"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poison 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poison 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259605190,
      "modifiedTime": 1721259923410,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tractor Beam",
    "type": "move",
    "_id": "iuF0phDA7IUForGE",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Tractor Beam Attack",
          "slug": "tractor-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The target is Lifted 5.</p>"
        }
      ],
      "description": "<p>Effect: The target is Lifted 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314375384,
      "modifiedTime": 1721314485132,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tremor",
    "type": "move",
    "_id": "nxP4qVlVXnGSUbbX",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "3-strike",
        "earthbound"
      ],
      "actions": [
        {
          "name": "Tremor Attack",
          "slug": "tremor-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "3-strike",
            "earthbound"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": 20,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, the target has a 40% chance to lose -1 SPD stage for 5 activations.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720800556737,
      "modifiedTime": 1720800610604,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Trip Up",
    "type": "move",
    "_id": "fnIgZ19W0VPLZj4d",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "interrupt-4",
        "contact"
      ],
      "actions": [
        {
          "name": "Trip Up Attack",
          "slug": "trip-up-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "interrupt-4",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": "The user is targeted by a [Priority X] Attack."
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Trigger: The user is targeted by a [Priority X] Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with Trip Up, if possible. The target becomes Flinched 5 on hit and if the target Faints due to damage from this attack, the triggering attack fails.</p>"
        }
      ],
      "description": "<p>Trigger: The user is targeted by a [Priority X] Attack.</p><p>Effect: The user can freely move up to half of the Movement Score of their choice towards the target and then attacks with Trip Up, if possible. The target becomes Flinched 5 on hit and if the target Faints due to damage from this attack, the triggering attack fails.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 10700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738952312,
      "modifiedTime": 1719978657343,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tritone Chime",
    "type": "move",
    "_id": "yCNuSPaHG0lA1Otw",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "3-strike",
        "friendly"
      ],
      "actions": [
        {
          "name": "Tritone Chime Attack",
          "slug": "tritone-chime-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "3-strike",
            "friendly"
          ],
          "range": {
            "target": "emanation",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "special",
          "power": 25,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720463354291,
      "modifiedTime": 1720463447680,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Tsunami",
    "type": "move",
    "_id": "2XaWuI8GW96AWkoR",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "delay-2"
      ],
      "actions": [
        {
          "name": "Tsunami Attack",
          "slug": "tsunami-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "delay-2"
          ],
          "range": {
            "target": "wide-line",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 130,
          "accuracy": 70,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On resolution, the user loses -1 SPATK, SPDEF, and SPD stages for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319532650,
      "modifiedTime": 1721319658257,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Turbulence",
    "type": "move",
    "_id": "XXCePxLAOXx9aSHb",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind"
      ],
      "actions": [
        {
          "name": "Turbulence Attack",
          "slug": "turbulence-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind"
          ],
          "range": {
            "target": "wide-line",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets drop their Accessory and Belt items to the ground.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets drop their Accessory and Belt items to the ground.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 10800000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719598383379,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Typhoon",
    "type": "move",
    "_id": "UIFcGRSEuPQ5afL1",
    "img": "systems/ptr2e/img/icons/flying_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind"
      ],
      "actions": [
        {
          "name": "Typhoon Attack",
          "slug": "typhoon-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 8,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "flying"
          ],
          "category": "special",
          "power": 150,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This Attack's Power is equal to: <code>150 x UserCurrentHP/UserMaxHP</code>. </p>"
        }
      ],
      "description": "<p>Effect: This attack's Power ranges based on how healthy the user is, ranging from 1 to 150.\\\\n</p><blockquote><p>Damage Formula: Power = max(1, 150 x UserCurrentHP/UserMaxHP)</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 10900000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719598516183,
      "modifiedTime": 1719978698202,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Unshackled Mind",
    "type": "move",
    "_id": "Sc36h9DFYvJHQlMs",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Unshackled Mind Attack",
          "slug": "unshackled-mind-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "self",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The user reduces their HP by 50% of their Max HP. Then, they gain +12 SPATK stages for 5 activations. If the user's current HP is less than or equal to 1/2 of their Max HP, this attack fails.</p>"
        }
      ],
      "description": "<p>Effect: The user reduces their HP by 50% of their Max HP. Then, they gain +12 SPATK stages for 5 activations. If the user's current HP is less than or equal to 1/2 of their Max HP, this attack fails.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721264169115,
      "modifiedTime": 1721264218283,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Unthunder",
    "type": "move",
    "_id": "FZWZuzYRO2KLvlFe",
    "img": "systems/ptr2e/img/icons/electric_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "earthbound"
      ],
      "actions": [
        {
          "name": "Unthunder Attack",
          "slug": "unthunder-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "earthbound"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "electric"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is Super Effective against the Ground Type.</p>"
        }
      ],
      "description": "<p>Effect: This attack is Super Effective against the Ground Type.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 11000000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718744309382,
      "modifiedTime": 1719978898562,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Upheaval",
    "type": "move",
    "_id": "DLelp3vMFN5rrPi0",
    "img": "systems/ptr2e/img/icons/ground_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode"
      ],
      "actions": [
        {
          "name": "Upheaval Attack",
          "slug": "upheaval-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode"
          ],
          "range": {
            "target": "emanation",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 9,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ground"
          ],
          "category": "physical",
          "power": 150,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack's Power ranges based on how healthy the user is, ranging from 1 to 150.</p><blockquote><p>Damage Formula: Power = max(1, 150 x UserCurrentHP/UserMaxHP)</p></blockquote>"
        }
      ],
      "description": "<p>Effect: This attack's Power ranges based on how healthy the user is, ranging from 1 to 150.</p><blockquote><p>Damage Formula: Power = max(1, 150 x UserCurrentHP/UserMaxHP)</p></blockquote>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720800447486,
      "modifiedTime": 1720800525515,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Uproot",
    "type": "move",
    "_id": "pzsJZi4FPUSpBvMt",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "dash",
        "push-6",
        "contact"
      ],
      "actions": [
        {
          "name": "Uproot Attack",
          "slug": "uproot-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "dash",
            "push-6",
            "contact"
          ],
          "range": {
            "target": "cone",
            "distance": 2,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720797527936,
      "modifiedTime": 1720797602214,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Valiant Horn",
    "type": "move",
    "_id": "PmWd3TEzzyLdnZ60",
    "img": "systems/ptr2e/img/icons/bug_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "recoil-1-3",
        "contact",
        "dash",
        "horn"
      ],
      "actions": [
        {
          "name": "Valiant Horn Attack",
          "slug": "valiant-horn-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "recoil-1-3",
            "contact",
            "dash",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "bug"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 12700000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718730222925,
      "modifiedTime": 1719978958901,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Vampire Fang",
    "type": "move",
    "_id": "SXdVIJYOq4ZMMTnC",
    "img": "systems/ptr2e/img/icons/ghost_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "drain-1-3",
        "jaw",
        "contact",
        "grapple"
      ],
      "actions": [
        {
          "name": "Vampire Fang Attack",
          "slug": "vampire-fang-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "drain-1-3",
            "jaw",
            "contact",
            "grapple"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "ghost"
          ],
          "category": "physical",
          "power": 75,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720463463424,
      "modifiedTime": 1720463536362,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Vector Ray",
    "type": "move",
    "_id": "pspXzHLwFBsXdrAu",
    "img": "systems/ptr2e/img/icons/steel_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray",
        "danger-close"
      ],
      "actions": [
        {
          "name": "Vector Ray Attack",
          "slug": "vector-ray-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray",
            "danger-close"
          ],
          "range": {
            "target": "creature",
            "distance": 8,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "steel"
          ],
          "category": "special",
          "power": 60,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721314506657,
      "modifiedTime": 1721314556065,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Venomous Vex",
    "type": "move",
    "_id": "tdv6I3YSwXkmvwWI",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "contact",
        "defensive"
      ],
      "actions": [
        {
          "name": "Venomous Vex Attack",
          "slug": "venomous-vex-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "contact",
            "defensive"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Smoggy or Gloomy Weather, then they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolves this attack. On hit, the target gains Poison 5.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user gains Braced 1, and ends their activation. If the user is affected by Smoggy or Gloomy Weather, then they Set-Up and resolve this Attack on the same activation.</p><p>Resolution: On their next activation, they attack with and resolves this attack. On hit, the target gains Poison 5.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259795299,
      "modifiedTime": 1721259869954,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Vile Nail",
    "type": "move",
    "_id": "M1KdLCchJqZknhKe",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crit-1",
        "contact",
        "horn",
        "sharp"
      ],
      "actions": [
        {
          "name": "Vile Nail Attack",
          "slug": "vile-nail-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crit-1",
            "contact",
            "horn",
            "sharp"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "untyped"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poison 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Poison 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 13100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718735128644,
      "modifiedTime": 1719979000418,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Viral Gale",
    "type": "move",
    "_id": "eMcFchviqpKQU8zq",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "wind"
      ],
      "actions": [
        {
          "name": "Viral Gale Attack",
          "slug": "viral-gale-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "wind"
          ],
          "range": {
            "target": "wide-line",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 5,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "status",
          "power": null,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Valid targets that collide with other creatures when Pushed become Poisoned 5.</p>"
        }
      ],
      "description": "<p>Effect: Valid targets that collide with other creatures when Pushed become Poisoned 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721259972201,
      "modifiedTime": 1721260065412,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Viral Strike",
    "type": "move",
    "_id": "zDIpdmOihNqlcils",
    "img": "systems/ptr2e/img/icons/poison_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "horn"
      ],
      "actions": [
        {
          "name": "Viral Strike Attack",
          "slug": "viral-strike-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "horn"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "poison"
          ],
          "category": "physical",
          "power": 40,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "<p>Effect: On hit, the target has a 50% chance of gaining all Major Status Afflictions the user is afflicted with, at the same Stack values.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721260055996,
      "modifiedTime": 1721260574011,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Virtual Beam",
    "type": "move",
    "_id": "6m7Bifa4B95zhkoF",
    "img": "systems/ptr2e/img/icons/normal_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "ray"
      ],
      "actions": [
        {
          "name": "Virtual Beam Attack",
          "slug": "virtual-beam-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "ray"
          ],
          "range": {
            "target": "creature",
            "distance": 10,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "normal"
          ],
          "category": "special",
          "power": 50,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: This attack is treated as being super-effective against the target, and doubly super-effective if the target possesses at least 2 Types.</p>"
        }
      ],
      "description": "<p>Effect: This attack is treated as being super-effective against the target, and doubly super-effective if the target possesses at least 2 Types.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721066451103,
      "modifiedTime": 1721066617609,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Virulent Vibe",
    "type": "move",
    "_id": "cBJvbvEEcNvdvMtZ",
    "img": "systems/ptr2e/img/icons/dark_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "aura",
        "basic"
      ],
      "actions": [
        {
          "name": "Virulent Vibe Attack",
          "slug": "virulent-vibe-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "aura",
            "basic"
          ],
          "range": {
            "target": "emanation",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "dark"
          ],
          "category": "special",
          "power": 35,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Fear 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 10% chance of gaining Fear 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 11100000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1718738305421,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Viscous Sap",
    "type": "move",
    "_id": "fIc7szQpQo1rdfIk",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Viscous Sap Attack",
          "slug": "viscous-sap-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 4,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 60,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 40% chance to lose -1 SPATK stage for 5 activations and  a 40% chance to be Slowed 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 40% chance to lose -1 SPATK stage for 5 activations and  a 40% chance to be Slowed 5.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720795986461,
      "modifiedTime": 1720796289919,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Volcanic Ring",
    "type": "move",
    "_id": "fA3xOuu4inR26KVJ",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "set-up",
        "defensive",
        "blast-2",
        "defrost"
      ],
      "actions": [
        {
          "name": "Volcanic Ring Attack",
          "slug": "volcanic-ring-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "set-up",
            "defensive",
            "blast-2",
            "defrost"
          ],
          "range": {
            "target": "blast",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 6,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: Set-Up: The user forms a swirling ring of flames, gaining Rebound until this attack is resolved.</p><p>Resolution: On their next activation, the user attacks with and resolves this attack. Upon resolving this attack, the user gains Ring 5.</p>"
        }
      ],
      "description": "<p>Effect: Set-Up: The user forms a swirling ring of flames, gaining Rebound until this attack is resolved.</p><p>Resolution: On their next activation, the user attacks with and resolves this attack. Upon resolving this attack, the user gains Ring 5.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 11200000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596345230,
      "modifiedTime": 1719979099697,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Volcano Bomb",
    "type": "move",
    "_id": "IPOd8flt0gw6zvUN",
    "img": "systems/ptr2e/img/icons/fire_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "explode",
        "defrost",
        "blast-3"
      ],
      "actions": [
        {
          "name": "Volcano Bomb Attack",
          "slug": "volcano-bomb-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "explode",
            "defrost",
            "blast-3"
          ],
          "range": {
            "target": "blast",
            "distance": 6,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fire"
          ],
          "category": "special",
          "power": 90,
          "accuracy": 85,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Flinched 3.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets have a 30% chance of being Flinched 3.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 11300000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719596788739,
      "modifiedTime": 1719971994938,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Water Bomb",
    "type": "move",
    "_id": "Ud4U0d3ryImC3RaB",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "missile"
      ],
      "actions": [
        {
          "name": "Water Bomb Attack",
          "slug": "water-bomb-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "missile"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "special",
          "power": 70,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all creatures adjacent to the target take a Tick of HP damage. This effect is considered be an [Explode] effect.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all creatures adjacent to the target take a Tick of HP damage. This effect is considered be an [Explode] effect.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319677517,
      "modifiedTime": 1721319744443,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Water Hammer",
    "type": "move",
    "_id": "jrzE3Z91OwBphf21",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact"
      ],
      "actions": [
        {
          "name": "Water Hammer Attack",
          "slug": "water-hammer-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "physical",
          "power": 100,
          "accuracy": 90,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the user loses -1 SPD stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the user loses -1 SPD stage for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721319943047,
      "modifiedTime": 1721320002166,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Waterlog",
    "type": "move",
    "_id": "aWXKmOdWDG5gC5YJ",
    "img": "systems/ptr2e/img/icons/water_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Waterlog Attack",
          "slug": "waterlog-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 3,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "water"
          ],
          "category": "status",
          "power": null,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target loses -2 SPATK stage for 5 activations. If the target is a Water-Type they instead have their SPATK increased by +2 for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target loses -2 SPATK stage for 5 activations. If the target is a Water-Type they instead have their SPATK increased by +2 for 5 activations.</p>",
      "container": null,
      "grade": "C"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721320069877,
      "modifiedTime": 1721320152705,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Weary Wave",
    "type": "move",
    "_id": "6PB2pT8mDdI3OvPU",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "pulse"
      ],
      "actions": [
        {
          "name": "Weary Wave Attack",
          "slug": "weary-wave-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "pulse"
          ],
          "range": {
            "target": "creature",
            "distance": 5,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 1,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "special",
          "power": 40,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Drowsy 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Drowsy 5.</p>",
      "container": null,
      "grade": "E"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721264237223,
      "modifiedTime": 1721264312188,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Whiplash",
    "type": "move",
    "_id": "pxM6ahlywPGdgKRd",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [],
      "actions": [
        {
          "name": "Whiplash Attack",
          "slug": "whiplash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [],
          "range": {
            "target": "creature",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 2,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "physical",
          "power": 65,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, the target has a 10% chance of gaining Confused 5.</p>"
        }
      ],
      "description": "<p>Effect: On hit, the target has a 10% chance of gaining Confused 5.</p>",
      "container": null,
      "grade": "D"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720797645046,
      "modifiedTime": 1720797722100,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Whirling Rondé",
    "type": "move",
    "_id": "7rks31mDtXuY2MKb",
    "img": "systems/ptr2e/img/icons/fairy_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "contact",
        "dance",
        "priority-1"
      ],
      "actions": [
        {
          "name": "Whirling Rondé Attack",
          "slug": "whirling-rondé-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "contact",
            "dance",
            "priority-1"
          ],
          "range": {
            "target": "emanation",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": 1,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "fairy"
          ],
          "category": "physical",
          "power": 55,
          "accuracy": 95,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: On hit, all valid targets lose -1 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: On hit, all valid targets lose -1 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 11400000,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.327",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.0.4",
      "createdTime": 1719587074437,
      "modifiedTime": 1719979262907,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Wild Shriek",
    "type": "move",
    "_id": "tA3PiasZuKZIlvrW",
    "img": "systems/ptr2e/img/icons/grass_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "sonic",
        "delay-2"
      ],
      "actions": [
        {
          "name": "Wild Shriek Attack",
          "slug": "wild-shriek-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "sonic",
            "delay-2"
          ],
          "range": {
            "target": "cone",
            "distance": 3,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 7,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "grass"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: All valid targets lose -2 SPDEF stages for 5 activations, and user gains +1 SPATK stage for 5 activations.</p>"
        }
      ],
      "description": "<p>Effect: All valid targets lose -2 SPDEF stages for 5 activations, and user gains +1 SPATK stage for 5 activations.</p>",
      "container": null,
      "grade": "A"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1720810674304,
      "modifiedTime": 1720810762766,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Zen Smash",
    "type": "move",
    "_id": "OqIqEn3Y6Iw5U7f5",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "crushing",
        "contact",
        "recoil-1-3"
      ],
      "actions": [
        {
          "name": "Zen Smash Attack",
          "slug": "zen-smash-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "crushing",
            "contact",
            "recoil-1-3"
          ],
          "range": {
            "target": "creature",
            "distance": 1,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "physical",
          "power": 120,
          "accuracy": 100,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": ""
        }
      ],
      "description": "",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721264427882,
      "modifiedTime": 1721264482798,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  },
  {
    "folder": "PTzDJPvM7Mjj7e8k",
    "name": "Zero Room",
    "type": "move",
    "_id": "SQxhFSQgNCfFf5qe",
    "img": "systems/ptr2e/img/icons/psychic_icon.png",
    "system": {
      "slug": null,
      "traits": [
        "room"
      ],
      "actions": [
        {
          "name": "Zero Room Attack",
          "slug": "zero-room-attack",
          "type": "attack",
          "img": "icons/svg/explosion.svg",
          "traits": [
            "room"
          ],
          "range": {
            "target": "field",
            "distance": 0,
            "unit": "m"
          },
          "cost": {
            "activation": "complex",
            "powerPoints": 4,
            "delay": null,
            "priority": null,
            "trigger": ""
          },
          "variant": null,
          "types": [
            "psychic"
          ],
          "category": "status",
          "power": null,
          "accuracy": null,
          "contestType": "",
          "contestEffect": "",
          "free": false,
          "slot": null,
          "description": "<p>Effect: The Room is set to Zero Room for 3 Rounds.</p>"
        }
      ],
      "description": "<p>Effect: The Room is set to Zero Room for 3 Rounds.</p>",
      "container": null,
      "grade": "B"
    },
    "effects": [],
    "sort": 0,
    "ownership": {
      "default": 0,
      "CYLdyr5mPSDmNpTp": 3
    },
    "flags": {},
    "_stats": {
      "compendiumSource": null,
      "duplicateSource": null,
      "coreVersion": "12.328",
      "systemId": "ptr2e",
      "systemVersion": "0.10.0-alpha.1.5.2",
      "createdTime": 1721264368469,
      "modifiedTime": 1721264411631,
      "lastModifiedBy": "CYLdyr5mPSDmNpTp"
    }
  }
]

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-moves");

for (const packSource of data) {
  // Run Migration 101
  if (packSource.img.startsWith("systems/ptr2e/img/icons/") && packSource.img.endsWith(".png")) {
    packSource.img = packSource.img.replace("/icons/", "/svg/").replace(".png", ".svg");
  }

  //@ts-expect-error
  if (!packSource.system.actions[0].description) packSource.system.actions[0].description = packSource.system.description;
    packSource.system.description = ""

    fs.writeFileSync(`${packsDataPath}/${sluggify(packSource.name)}.json`, JSON.stringify(packSource, null, 2));
}