export const CircumstanceModifierGroups = Object.freeze({
  combat: {
    id: "combat",
    title: "PTR2E.CircumstanceModifiers.Combat",
    modifiers: [
      {
        id: "major-npc-defeated",
        label: "PTR2E.CircumstanceModifiers.Modifiers.MajorNPCDefeated.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.MajorNPCDefeated.hint",
        name: "combat.major-npc-defeated",
        checked: false,
        value: 2
      },
      {
        id: "won-encounter",
        label: "PTR2E.CircumstanceModifiers.Modifiers.WonEncounter.label",
        name: "combat.won-encounter",
        checked: false,
        value: 0.5
      },
      {
        id: "thwarted-evil-plans",
        label: "PTR2E.CircumstanceModifiers.Modifiers.ThwartedEvilPlans.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.ThwartedEvilPlans.hint",
        name: "combat.thwarted-evil-plans",
        checked: false,
        value: 0.4
      },
      {
        id: "impressive-strategy",
        label: "PTR2E.CircumstanceModifiers.Modifiers.ImpressiveStrategy.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.ImpressiveStrategy.hint",
        name: "combat.impressive-strategy",
        checked: false,
        value: 0.4
      },
      {
        id: "impressed-major-npc",
        label: "PTR2E.CircumstanceModifiers.Modifiers.ImpressedMajorNPC.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.ImpressedMajorNPC.hint",
        name: "combat.impressed-major-npc",
        checked: false,
        value: 0.2
      },
      {
        id: "entertain-the-crowd",
        label: "PTR2E.CircumstanceModifiers.Modifiers.EntertainTheCrowd.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.EntertainTheCrowd.hint",
        name: "combat.entertain-the-crowd",
        checked: false,
        value: 0.2
      },
      {
        id: "ally-saved",
        label: "PTR2E.CircumstanceModifiers.Modifiers.AllySaved.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.AllySaved.hint",
        name: "combat.ally-saved",
        checked: false,
        value: 0.1
      },
      {
        id: "succeed-against-odds",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.hint",
        name: "combat.succeed-against-odds",
        checked: false,
        value: 0.2
      },
      {
        id: "capture-new-species",
        label: "PTR2E.CircumstanceModifiers.Modifiers.CaptureNewSpecies.label",
        name: "combat.capture-new-species",
        checked: false,
        value: 0.1
      },
      {
        id: "destroyed-public-infrastructure",
        label: "PTR2E.CircumstanceModifiers.Modifiers.DestroyedPublicInfrastructure.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.DestroyedPublicInfrastructure.hint",
        name: "combat.destroyed-public-infrastructure",
        checked: false,
        value: -0.15
      },
      {
        id: "lost-encounter",
        label: "PTR2E.CircumstanceModifiers.Modifiers.LostEncounter.label",
        name: "combat.lost-encounter",
        checked: false,
        value: -0.3
      },
      {
        id: "half-party-fainted",
        label: "PTR2E.CircumstanceModifiers.Modifiers.HalfPartyFainted.label",
        name: "combat.half-party-fainted",
        checked: false,
        value: -0.3
      },
      {
        id: "party-defeated",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PartyDefeated.label",
        name: "combat.party-defeated",
        checked: false,
        value: -0.5
      }
    ]
  },
  social: {
    id: "social",
    title: "PTR2E.CircumstanceModifiers.Social",
    modifiers: [
      {
        id: "major-influencer",
        label: "PTR2E.CircumstanceModifiers.Modifiers.MajorInfluencer.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.MajorInfluencer.hint",
        name: "social.major-influencer",
        checked: false,
        value: 1
      },
      {
        id: "avoid-fight",
        label: "PTR2E.CircumstanceModifiers.Modifiers.AvoidFight.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.AvoidFight.hint",
        name: "social.avoid-fight",
        checked: false,
        value: 0.5
      },
      {
        id: "convincing-story",
        label: "PTR2E.CircumstanceModifiers.Modifiers.ConvincingStory.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.ConvincingStory.hint",
        name: "social.convincing-story",
        checked: false,
        value: 0.3
      },
      {
        id: "very-persuasive",
        label: "PTR2E.CircumstanceModifiers.Modifiers.VeryPersuasive.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.VeryPersuasive.hint",
        name: "social.very-persuasive",
        checked: false,
        value: 0.3
      },
      {
        id: "won-argument",
        label: "PTR2E.CircumstanceModifiers.Modifiers.WonArgument.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.WonArgument.hint",
        name: "social.won-argument",
        checked: false,
        value: 0.3
      },
      {
        id: "awesome-roleplay",
        label: "PTR2E.CircumstanceModifiers.Modifiers.AwesomeRoleplay.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.AwesomeRoleplay.hint",
        name: "social.awesome-roleplay",
        checked: false,
        value: 0.3
      },
      {
        id: "made-the-table-laugh",
        label: "PTR2E.CircumstanceModifiers.Modifiers.MadeTheTableLaugh.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.MadeTheTableLaugh.hint",
        name: "social.made-the-table-laugh",
        checked: false,
        value: 0.3
      },
      {
        id: "quick-witted",
        label: "PTR2E.CircumstanceModifiers.Modifiers.QuickWitted.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.QuickWitted.hint",
        name: "social.quick-witted",
        checked: false,
        value: 0.3
      },
      {
        id: "succeeed-against-odds",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.hint",
        name: "social.succeeed-against-odds",
        checked: false,
      },
      {
        id: "capture-new-species",
        label: "PTR2E.CircumstanceModifiers.Modifiers.CaptureNewSpecies.label",
        name: "social.capture-new-species",
        checked: false,
        value: 0.1
      },
      {
        id: "offended-npc",
        label: "PTR2E.CircumstanceModifiers.Modifiers.OffendedNPC.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.OffendedNPC.hint",
        name: "social.offended-npc",
        checked: false,
        value: -0.2
      }
    ]
  },
  exploration: {
    id: "exploration",
    title: "PTR2E.CircumstanceModifiers.Exploration",
    modifiers: [
      {
        id: "found-goal",
        label: "PTR2E.CircumstanceModifiers.Modifiers.FoundGoal.label",
        name: "exploration.found-goal",
        checked: false,
        value: 0.3
      },
      {
        id: "successful-camp",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SuccessfulCamp.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.SuccessfulCamp.hint",
        name: "exploration.successful-camp",
        checked: false,
        value: 0.3
      },
      {
        id: "clear-blocked-path",
        label: "PTR2E.CircumstanceModifiers.Modifiers.ClearBlockedPath.label",
        name: "exploration.clear-blocked-path",
        checked: false,
        value: 0.3
      },
      {
        id: "solve-puzzle",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SolvePuzzle.label",
        name: "exploration.solve-puzzle",
        checked: false,
        value: 0.3
      },
      {
        id: "do-skill-challenge",
        label: "PTR2E.CircumstanceModifiers.Modifiers.DoSkillChallenge.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.DoSkillChallenge.hint",
        name: "exploration.do-skill-challenge",
        checked: false,
        value: 0.3
      },
      {
        id: "succeed-against-odds",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.hint",
        name: "exploration.succeed-against-odds",
        checked: false,
        value: 0.2
      },
      {
        id: "capture-new-species",
        label: "PTR2E.CircumstanceModifiers.Modifiers.CaptureNewSpecies.label",
        name: "exploration.capture-new-species",
        checked: false,
        value: 0.1
      }
    ]
  },
  contests: {
    id: "contests",
    title: "PTR2E.CircumstanceModifiers.Contests",
    modifiers: [
      {
        id: "place-first",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceFirst.label",
        name: "contests.place-first",
        checked: false,
        value: 1
      },
      {
        id: "place-second",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceSecond.label",
        name: "contests.place-second",
        checked: false,
        value: 0.5
      },
      {
        id: "place-third",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceThird.label",
        name: "contests.place-third",
        checked: false,
        value: 0.25
      },
      {
        id: "win-introduction",
        label: "PTR2E.CircumstanceModifiers.Modifiers.WinIntroduction.label",
        name: "contests.win-introduction",
        checked: false,
        value: 0.2
      },
      {
        id: "trick-opponent",
        label: "PTR2E.CircumstanceModifiers.Modifiers.TrickOpponent.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.TrickOpponent.hint",
        name: "contests.trick-opponent",
        checked: false,
        value: 0.2
      },
      {
        id: "top-performer",
        label: "PTR2E.CircumstanceModifiers.Modifiers.TopPerformer.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.TopPerformer.hint",
        name: "contests.top-performer",
        checked: false,
        value: 0.2
      },
      {
        id: "last-place",
        label: "PTR2E.CircumstanceModifiers.Modifiers.LastPlace.label",
        name: "contests.last-place",
        checked: false,
        value: -0.1
      }
    ]
  },
  pokeathlons: {
    id: "pokeathlons",
    title: "PTR2E.CircumstanceModifiers.Pokeathlons",
    modifiers: [
      {
        id: "place-first",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceFirst.label",
        name: "pokeathlons.place-first",
        checked: false,
        value: 1
      },
      {
        id: "place-second",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceSecond.label",
        name: "pokeathlons.place-second",
        checked: false,
        value: 0.5
      },
      {
        id: "place-third",
        label: "PTR2E.CircumstanceModifiers.Modifiers.PlaceThird.label",
        name: "pokeathlons.place-third",
        checked: false,
        value: 0.25
      },
      {
        id: "win-any-section",
        label: "PTR2E.CircumstanceModifiers.Modifiers.WinAnySection.label",
        name: "pokeathlons.win-any-section",
        checked: false,
        value: 0.2
      },
      {
        id: "succeed-against-odds",
        label: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.SucceedAgainstOdds.hint",
        name: "pokeathlons.succeed-against-odds",
        checked: false,
        value: 0.2
      },
      {
        id: "last-place",
        label: "PTR2E.CircumstanceModifiers.Modifiers.LastPlace.label",
        name: "pokeathlons.last-place",
        checked: false,
        value: -0.1
      }
    ]
  },
  other: {
    id: "other",
    title: "PTR2E.CircumstanceModifiers.Other",
    modifiers: [
      {
        id: "baby-steps",
        label: "PTR2E.CircumstanceModifiers.Modifiers.BabySteps.label",
        hint: "PTR2E.CircumstanceModifiers.Modifiers.BabySteps.hint",
        name: "other.baby-steps",
        checked: false,
        value: 1
      }
    ]
  },
  custom: {
    id: "custom",
    title: "PTR2E.CircumstanceModifiers.Custom",
    modifiers: []
  }
} as Record<"combat" | "social" | "exploration" | "contests" | "pokeathlons" | "other" | "custom", CircumstanceModifierGroup>);

export interface CircumstanceModifierGroup {
  id: string;
  title: string;
  modifiers: CircumstanceModifier[]
}

export interface CircumstanceModifier {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  value: number;
  name: string;
}