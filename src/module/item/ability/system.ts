import { AbilityPTR2e, ItemSystemPTR2e } from "@item";

class AbilitySystemPTR2e extends ItemSystemPTR2e {
    
}

interface AbilitySystemPTR2e extends ItemSystemPTR2e {
    type: "ability";

    parent: AbilityPTR2e;
}

export { AbilitySystemPTR2e };