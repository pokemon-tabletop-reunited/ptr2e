import type { PokemonType } from "../../constants";

type TypeEffectiveness = {
  [type in PokemonType]: {
    images: {
      icon: string;
      bar: string;
    };
    effectiveness: {
      [type in PokemonType]: number;
    };
  };
}

interface TypeSchema extends foundry.data.fields.DataSchema {
  types: foundry.data.fields.SetField<TypeField, TypesFieldOptions>;
}
type TypesFieldOptions = { required: true, initial: PokemonType[], nullable: false, label: string, hint: string, validate: foundry.data.fields.DataField.Validator<foundry.data.fields.SetField<TypeField, TypesFieldOptions>, Iterable<PokemonType>>, validationError: string }

type TypeField = foundry.data.fields.StringField<TypeFieldOptions, keyof TypeEffectiveness>;
type TypeFieldOptions = { required: true, initial: keyof TypeEffectiveness, nullable: false }

type GenderOptions = "genderless" | "male" | "female";

type SizeTypes = "height" | "quad" | "length";
type SizeCategory = "Diminutive" | "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gigantic" | "Titanic" | "Max";
type SpeciesSize = {
  sizeClass: number;
  sizeCategory: SizeCategory;
}

export type {
  TypeEffectiveness,
  TypeSchema,
  TypesFieldOptions,
  TypeField,
  TypeFieldOptions,
  GenderOptions,
  SizeTypes,
  SizeCategory,
  SpeciesSize,
}