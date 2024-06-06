# Pokemon Tabletop Reunited 2nd Edition
Installing the system is incredibly easy, just plug the manifest URL into Foundry's System Install window:
```
https://2e.ptr.wiki/foundry/download?repo=ptr2e
```

Alongside this you'll likely want to install the basic sprite collection too (this is a Module not a System):
```
https://2e.ptr.wiki/foundry/download?repo=ptr2e-pokemon-sprite-collection
```

## Contributing
To install the project it's quite simple, first clone it to your local.

After you've done so you can run `npm install` to install all dependencies.

Next run `npm run link` to setup the symlink with your Foundry Data Folder and the `/dist` folder.

To turn on the development server run `npm run serve`, this will automatically enable hot-reloading.

Finally you can run `npm run build` to build a production version of the codebase.