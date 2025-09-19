// Go through all folders in the packs directory and check its JSON files
import fs from "fs";
import path from "path";

import { getFilesRecursively, sluggify } from "../helpers.js";

describe("Compendium Pack Data", () => {

  let packs = [];

  beforeAll(() => {
    // eslint-disable-next-line no-undef
    const packsDataPath = path.resolve(__dirname, "../../packs");
    // eslint-disable-next-line no-undef
    const packDirPaths = fs.readdirSync(packsDataPath).map((dirName) => path.resolve(__dirname, packsDataPath, dirName));

    packs = packDirPaths.map((dirPath) => {
      const {filePaths, folderPaths} = getFilesRecursively(dirPath);
      const fileData = filePaths.flatMap((filepath) => {
        const jsonString = fs.readFileSync(filepath, "utf-8");
        const packSource = (() => {
          try {
            return JSON.parse(jsonString);
          } catch (error) {
            if (error instanceof Error) {
              throw Error(`File ${filepath} could not be parsed: ${error.message}`);
            }
          }
        })();

        if (Array.isArray(packSource)) {
          throw Error(`File ${filepath} should not be an array`);
        }

        const documentName = packSource?.name;
        if (documentName === undefined) {
          throw Error(`Document contained in ${filepath} has no name.`);
        }

        const filenameForm = (documentName.startsWith("-") ? "-" : "") + sluggify(documentName).concat(".json");
        if (path.basename(filepath) !== filenameForm) {
          throw Error(`Filename at ${filepath} does not reflect document name (should be ${filenameForm}).`);
        }

        return [packSource]
      })
      const folderData = folderPaths.flatMap((folderPath) => {
        const jsonString = fs.readFileSync(folderPath, "utf-8");
        const folderData = (() => {
          try {
            return JSON.parse(jsonString);
          } catch (error) {
            if (error instanceof Error) {
              throw Error(`File ${folderPath} could not be parsed: ${error.message}`);
            }
          }
        })();

        return folderData;
      });

      return {
        pack: path.basename(dirPath),
        entries: fileData,
        folders: folderData
      }
    });
  })

  test("Packs data should be present", () => {
    expect(packs.length).toBeGreaterThan(0);
  });

  test("All pack items and sub items should have _id properties set", () => {
    for (const pack of packs) {
      for (const entry of pack.entries) {
        try {
          expect(entry).toHaveProperty("_id");
          expect(typeof entry._id).toBe("string");
          expect(entry._id.length).toBeGreaterThan(0);
  
          if(entry.effects && Array.isArray(entry.effects)) {
            for (const effect of entry.effects) {
              try {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(effect).toHaveProperty("_id");
                // eslint-disable-next-line jest/no-conditional-expect
                expect(effect._id).toBeDefined();
                // eslint-disable-next-line jest/no-conditional-expect
                expect(typeof effect._id).toBe("string");
                // eslint-disable-next-line jest/no-conditional-expect
                expect(effect._id.length).toBeGreaterThan(0);
              } catch (error) {
                throw Error(`Effect ${effect.slug ?? effect.system?.slug ?? effect.name ?? effect.label} (${effect._id}) in ${pack.pack} pack within entry ${entry.slug ?? entry.system?.slug ?? entry.name ?? entry.label} (${entry._id}) does not have a valid _id property:\n${error.message}`, { cause: "effect"});
              }
            }
          }
        }
        catch (error) {
          if(error.cause === "effect") throw error;
          throw Error(`Entry ${entry.slug ?? entry.system?.slug ?? entry.name ?? entry.label} (${entry._id}) in ${pack.pack} pack does not have a valid _id property:\n${error.message}`);
        }
      }
    }
  });

  test("Packs cannot contain duplicate IDs", () => {
    const allIds = new Set();
    for (const pack of packs) {
      for (const entry of pack.entries) {
        if (allIds.has(entry._id)) {
          throw Error(`Duplicate ID found: ${entry._id} in pack ${pack.pack}`);
        }
        allIds.add(entry._id);
      }
    }
    
    expect(allIds.size).toBe(packs.reduce((acc, pack) => acc + pack.entries.length, 0));
  })

  // eslint-disable-next-line jest/expect-expect, jest/no-commented-out-tests
  // test("Pack entries should not point to folders that do not exist", () => {
  //   for (const pack of packs) {
  //     for (const entry of pack.entries) {
  //       let success = false;
  //       for(const folder of pack.folders ?? []) {
  //         if(entry.folder === folder._id) {
  //           success = true;
  //           break;
  //         }
  //       }
  //       if(entry.folder && !success) {
  //         throw Error(`Entry ${entry.slug ?? entry.system?.slug ?? entry.name ?? entry.label} (${entry._id}) in pack ${pack.pack} points to a folder that does not exist: ${entry.folder}`);
  //       }
  //     }
  //   }
  // });
});