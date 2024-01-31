// @ts-nocheck

import { TokenDocumentPTR2e } from "../canvas/token/document.ts";

/**
 * @extends {PTRActorData}
 */
class PTRActor<TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null> extends Actor<TParent> {

    /**
     * @returns {Trait[]}
     */
    get traits() {
        return this.system.traits;
    }

    /**
     * @returns {Attributes}
     */
    get attributes() {
        return this.system.attributes;
    }

    /** 
     * Step 1 - Copies data from source object to instance attributes
     * @override 
     * */
    _initialize() {
        return super._initialize();
    }

    /** 
     * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
     * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
     * @override 
     * */
    prepareData() {
        this.health = {
            percent: parseInt(Math.floor(Math.random() * 100))
        }

        return super.prepareData();
    }

    /**
     * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
     * @override 
     * */
    prepareBaseData() {
        return super.prepareBaseData();
    }

    /** 
     * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
     * @override 
     * */
    prepareEmbeddedDocuments() {
        return super.prepareEmbeddedDocuments();
    }

    /** 
     * Step 5 - Apply transformations or derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     * @override 
     * */
    prepareDerivedData() {
        return super.prepareDerivedData();
    }

    /**
     * Toggle the perk tree for this actor
     * @param {boolean} active 
     */
    async togglePerkTree(active) {
        if((game.ptr.tree.actor === this) && (active !== true)) return game.ptr.tree.close();
        else if(active !== false) return game.ptr.tree.open(this);
    }

}

/**
 * @type {PTRActor}
*/
const PTRActorProxy = new Proxy(PTRActor, {
    construct(_target, args) {
        return new PTRActor(...args); //TODO: later change this if we add more actor types
    }
})

export { PTRActor, PTRActorProxy}