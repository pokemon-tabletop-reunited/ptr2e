import { GrantItemChangeSystem } from "@data";

class GrantEffectChangeSystem extends GrantItemChangeSystem {
  static override TYPE = "grant-effect";

  static override defineSchema() {
    const schema = super.defineSchema();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    schema.value.validate = () => { };
    //@ts-expect-error - Monkeypatch in choices
    schema.value.options.choices = CONFIG.PTR.statusEffects.reduce((choices, status) => {
      choices[status.id!] = status.name!;
      return choices;
    }, {} as Record<string, string>);
    return schema;
  }

  override apply(): void {
    // TODO: Implement createInMemoryCondition
  }

  override async getItem(key: string = this.resolveInjectedProperties(this.uuid)): Promise<Maybe<ClientDocument>> {
    try {
      const effect = await CONFIG.ActiveEffect.documentClass.fromStatusEffect(key)
      return effect;
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default GrantEffectChangeSystem;
export { type GrantEffectChangeSystem }