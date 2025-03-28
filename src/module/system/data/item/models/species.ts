const speciesSchema = {
  foo: new foundry.data.fields.StringField({required: true})
}

declare namespace SpeciesSystem {
  type Schema = typeof speciesSchema;
}

class SpeciesSystem extends foundry.abstract.TypeDataModel<SpeciesSystem.Schema, Item.Implementation> {
  static override defineSchema() {
    return speciesSchema;
  }

  bar() {
    return this.foo;
  }
}

export {SpeciesSystem};