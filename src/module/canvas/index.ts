import type { SquareGridPTR2e } from './grid.ts';
import type { ScenePTR2e } from './scene.ts';
import type { TokenDocumentPTR2e } from './token/document.ts';
import type { TokenPTR2e } from './token/object.ts';

export { default as ScenePTR2e } from './scene.ts';

declare global {
  namespace PTR {
    namespace Scene {
      type Instance = ScenePTR2e;
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Scene.Schema>;
    }
    namespace Token {
      type Instance = TokenPTR2e;
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.Token.Schema>;
      type SourceWithDocument = Source & {document: TokenDocument.Source};
    }
    namespace TokenDocument {
      type Instance = TokenDocumentPTR2e;
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.TokenDocument.Schema>
    }
    namespace Grid {
      type Square = SquareGridPTR2e
    }
  }
}