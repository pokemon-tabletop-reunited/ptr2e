import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { ActorSystemPTR2e } from "@actor";

class ActorPTR2e<TSystem extends ActorSystemPTR2e = ActorSystemPTR2e, TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null> extends Actor<TParent, TSystem> {

    get traits() {
        return this.system.traits;
    }

    get attributes() {
        return this.system.attributes;
    }

    /** 
     * Step 1 - Copies data from source object to instance attributes
     * */
    override _initialize() {
        return super._initialize();
    }

    /** 
     * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
     * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
     * */
    override prepareData() {
        this.health = {
            percent: Math.floor(Math.random() * 100) 
        }

        return super.prepareData();
    }

    /**
     * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
     * */
    override prepareBaseData() {
        return super.prepareBaseData();
    }

    /** 
     * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
     * */
    override prepareEmbeddedDocuments() {
        return super.prepareEmbeddedDocuments();
    }

    /** 
     * Step 5 - Apply transformations or derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     * */
    override prepareDerivedData() {
        return super.prepareDerivedData();
    }

    /**
     * Toggle the perk tree for this actor
     * @param {boolean} active 
     */
    async togglePerkTree(active: boolean) {
        if((game.ptr.tree.actor === this) && (active !== true)) return game.ptr.tree.close();
        else if(active !== false) return game.ptr.tree.open(this);
    }

}

interface ActorPTR2e<TSystem extends ActorSystemPTR2e = ActorSystemPTR2e, TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null> extends Actor<TParent, TSystem> {
    health: {
        percent: number
    }
    synthetics: ActorSynthetics
}

export { ActorPTR2e }