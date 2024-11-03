import { CircumstanceModifier } from "@module/apps/exp.ts";



const BaseCircumstanceModifiers = {
    succeedAgainstAllOdds: {
        bonus: 20,
        label: "Succeed Against All Odds",
        groups: ["Combat", "Social", "Exploration", "Contests", "Pokeathlons"],
        hint: "<p>Succeed on a Skill Check in which you have less than 20 points invested!</p>"
    },
    captureNewSpecies: {
        bonus: 10,
        label: "Capture a New Species",
        groups: ["Combat", "Social", "Exploration", "Contests", "Pokeathlons"],
        hint: "<p>Capture a species you've never captured before.</p>"
    },

    majorNpcDefeated: {
        bonus: 200,
        label: "Major NPC Defeated",
        groups: ["Combat"],
        hint: "<p>Defeated a major NPC, such as a Gym Leader, Team Rocket Lieutenant or Rival. Feel free to increase this reward for higher-stakes fights with bosses such as Legendaries, or Elite Four members, or even Giovanni himself!</p>"
    },
    wonEncounter: {
        bonus: 50,
        label: "Won Encounter",
        groups: ["Combat"],
        hint: "<p>The players unambiguously won the encounter</p>"
    },
    thwartedEvilPlans: {
        bonus: 40,
        label: "Thwarted Evil Plans",
        groups: ["Combat"],
        hint: "<p>Think defeating a Pokemon that was terrorizing an area after Team Rocket pissed it off by attacking its young!</p><p>Or if you are the evil doers… thwarting the Forces of Good can be just as enticing…</p>"
    },
    impressiveUseOfStrategy: {
        bonus: 40,
        label: "Impressive Use of Strategy",
        groups: ["Combat"],
        hint: "<p>This can be anything like the Players using the terrain to their advantage; to impressive teamwork or even just quick thinking on the spot! Award your players for their ingenuity!</p><p>Some more examples:</p><ul><li>Defeating the Kangaskhan by having Scorbunny run around its legs with rope to take it down like an AT-AT</li><li>Destroy the nearby Water Tower to make everyone Wet and in for a Shocking Surprise.</li><li>The Stealth Rocks that Skarmory put up made it so that the Charizard couldn’t charge in against it and instead force it to come in close and fight the Seismitoad ready to fight in close-quarters with this Lizard!</li><li>You managed to allow the entire party to benefit from your Sandstorm strategy; yet they barely even have any Ground, Steel or Rock types!</li></ul>"
    },
    impressingMajorNPCs: {
        bonus: 20,
        label: "Impressing (Major) NPCs",
        groups: ["Combat"],
        hint: "<p>You may not have beaten the Elite Four member with your 3 gym badges… But they're impressed by how good you already are!</p><p>You can consider not giving the “Lost Encounter” penalty when awarding this bonus.</p>"
    },
    entertainTheCrowd: {
        bonus: 20,
        label: "Entertain The Crowd",
        groups: ["Combat"],
        hint: "<p>You really know how to give a show! The NPCs watching your fight be it Humans or Pokemon really loved watching that, or are happy and thankful you resolved the situation before it could further get out of hand.</p>"
    },
    allySaved: {
        bonus: 10,
        label: "Ally Saved",
        groups: ["Combat"],
        hint: "<p>You managed to save a Player-controlled or NPC ally; be it by reducing the damage they would receive by lowering it; making an attack miss; taking the hit yourself, or plainly removing the source of damage! Teamwork is the dreamwork!</p>"
    },
    fledEncounter: {
        bonus: 0,
        label: "Fled Encounter",
        groups: ["Combat"],
        hint: "<p>Running away is always a valid option!</p>"
    },
    destroyedPublicInfrastructure: {
        bonus: -15,
        label: "Destroyed Public Infrastructure",
        groups: ["Combat"],
        hint: "<p>You better have a good explanation for Officer Jenny…</p><p>Don't award this penalty if players received permission.</p>"
    },
    lostEncounter: {
        bonus: -30,
        label: "Lost Encounter",
        groups: ["Combat"],
        hint: "<p>Even the protagonist loses sometimes…</p>"
    },
    gruesome: {
        bonus: -30,
        label: "Gruesome",
        groups: ["Combat"],
        hint: "<p>Half the party or more fainted! Yikes. You may have bitten off a bit more than you can comfortably chew…</p>"
    },
    partyDefeat: {
        bonus: -50,
        label: "Party Defeat",
        groups: ["Combat"],
        hint: "<p>There certainly is experience to be gained in this manner… but not the type you were hoping for…</p>"
    },
    majorInfluencer: {
        bonus: 100,
        label: "Major Influencer",
        groups: ["Social"],
        hint: "<p>There certainly is experience to be gained in this manner… but not the type you were hoping for…</p>"
    },
    avoidedAFight: {
        bonus: 50,
        label: "Avoided a Fight",
        groups: ["Social"],
        hint: "<p>Wow that was gonna be scary, glad you talked your way out of it!</p><p>Only award this if the Fight was going to be challenging; talking down an angry Caterpie with your Charizard ain’t gonna award you additional EXP.</p>"
    },
    convincingStory: {
        bonus: 30,
        label: "Convincing Story",
        groups: ["Social"],
        hint: "<p>Who knows you could convince someone like that! You managed to convince someone of a fact that wasn’t… quite true, but surely it will help you achieve your goal!</p>"
    },
    veryPersuasive: {
        bonus: 30,
        label: "Very Persuasive",
        groups: ["Social"],
        hint: "<p>Sway someone to do something they didn’t originally plan to do; or didn’t agree with before, to now help you out / agree with!</p>"
    },
    whatAnArgument: {
        bonus: 30,
        label: "What an Argument!",
        groups: ["Social"],
        hint: "<p>You just made the GM stutter with how ingenious your argument was, awesome work.</p>"
    },
    awesomeRoleplay: {
        bonus: 30,
        label: "Awesome Roleplay",
        groups: ["Social"],
        hint: "<p>That was super in-character, absolutely loved it!</p>"
    },
    madeTheTableLaugh: {
        bonus: 30,
        label: "Made the Table Laugh",
        groups: ["Social"],
        hint: "<p>We’re playing games for fun right? Sometimes a Dad joke is appropriate after all…</p>"
    },
    quickWitted: {
        bonus: 30,
        label: "Quick-Witted",
        groups: ["Social"],
        hint: "<p>You handled that situation with ease despite being unprepared, or perhaps your information was incorrect? Either way, you did a great job!</p>"
    },
    offendedTheNPC: {
        bonus: -20,
        label: "Offended the NPC",
        groups: ["Social"],
        hint: "<p>You were trying to befriend them… not offend them…</p>"
    },
    findWhatYoureLookingFor: {
        bonus: 30,
        label: "Find What You're Looking For",
        groups: ["Exploration"],
        hint: "<p>You found what you were looking for.</p>"
    },
    successfulCamp: {
        bonus: 30,
        label: "Successful Camp",
        groups: ["Exploration"],
        hint: "<p>Succeed at more than half of your Camping Checks (min 1).</p>"
    },
    clearBlockedPath: {
        bonus: 30,
        label: "Clear a Blocked Path",
        groups: ["Exploration"],
        hint: ""
    },
    solvePuzzle: {
        bonus: 30,
        label: "Solve a Puzzle",
        groups: ["Exploration"],
        hint: ""
    },
    participateInSkillChallenge: {
        bonus: 30,
        label: "Participate in a Skill Challenge",
        groups: ["Exploration"],
        hint: "<p>Whether you succeed or lost; you helped move the plot forward! Succeed at a skill challenge set-up by the GM.</p>"
    },

    placeFirst: {
        bonus: 100,
        label: "Place First Overall",
        groups: ["Contests", "Pokeathlons"],
        hint: ""
    },
    placeSecond: {
        bonus: 50,
        label: "Place Second Overall",
        groups: ["Contests", "Pokeathlons"],
        hint: ""
    },
    placeThird: {
        bonus: 25,
        label: "Place Third Overall",
        groups: ["Contests", "Pokeathlons"],
        hint: ""
    },
    placeFourth: {
        bonus: -10,
        label: "Get Fourth Place or Worse Overall",
        groups: ["Contests", "Pokeathlons"],
        hint: ""
    },
    endFirst: {
        bonus: 20,
        label: "End First in the Introduction / Visual Phase",
        groups: ["Contests"],
        hint: ""
    },
    trickOpponent: {
        bonus: 20,
        label: "Trick Your Opponent",
        groups: ["Contests"],
        hint: "<p>Make your opponent Fumble through the usage of a cleverly timed move.</p>"
    },
    topPerformer: {
        bonus: 20,
        label: "Top Performer",
        groups: ["Contests"],
        hint: "<p>Score the highest amount of appeal in any round of the 'Secondary Judging' better known as the 'Moves Evaluation'</p>"
    },
    placeFirstInSection: {
        bonus: 20,
        label: "Place First in a Section of a Triathlon",
        groups: ["Pokeathlons"],
        hint: ""
    },
    derailing: {
        bonus: -20,
        label: "Derailing!",
        groups: ["Metagaming"],
        hint: "<p>Every time your players choose to actively derail the game, feel free to punish them.</p><p>Such as, if they went to explore a random tree, or went to take a nap and ignore the active quest to visit Professor Oak at his lab.</p>"
    },
    outOfCharacter: {
        bonus: -40,
        label: "Acting Significantly Out of Character",
        groups: ["Metagaming"],
        hint: "<p>Sure, breaking the fourth wall is often funny! But doing so in a way to metagame a scenario to \"win\" isn't always the best course of action. Nor the most fun!</p>"
    },
    capturingFaintedPokemon: {
        bonus: -30,
        label: "Capturing a Fainted Pokemon",
        groups: ["Metagaming"],
        hint: "<p>Many players' rationalizations after beating a Pokemon in combat is \"wait, why can't I catch this Pokemon? It's just lying there, motionless!\" Well, that goes against the \"spirit\" of the game!</p><p>Well, kind of. You can get around this by, say, nursing the fainted creature back to health, befriending it once it's awake, and capturing it properly.</p>"
    },
} as Record<string, CircumstanceModifier>;

export default BaseCircumstanceModifiers;