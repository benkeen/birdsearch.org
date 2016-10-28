# birdsearch.org

This is an experiment to try different ways of viewing eBird data to provide a better understanding of
bird sightings and distribution.

## Versions

### v2.0.0
Putting finishing touches. Should get out this weekend (Oct 28th).

-------------------------------------------
#### Remaining. Notes.

- translations
- check different browsers

##### Bugs
- species tip should hide after typing
- Bird species row should show up immediately after the first result returned.
- When species panel open, a fresh search doesn't automatically show the right contents.
- ??? "Warning: Failed prop type: Invalid prop `observationRecency` of type `number` supplied to `SearchSettings`, expected `string`."
- bloody columns still need to be correctly placed
- search for Vancouver, birds. Then in the settings panel switch to Notable and search from there. No results.

#### For 2.0.1:
- "51 bird species seen in the last 1 days"

--------------------------------------------


### v1.1.x
This is a complete re-write of the script to better organize the code, improve the site design and add a little
functionality. It includes the following additions over 1.0.0:

- Three search types: "bird sightings", "notable sightings", "popular birding locations"
- advanced search functionality
- multi-language support
- more accurate results based on lat/lng instead of human addresses (but the interface still has a simple address
search)

### v1.1.2
- bug fix for when you select an option from the dropdown, but it still tells you to select something when you submit
the form.
- cache-busting hash added to app-start JS file via Grunt.

### v1.0.x - initial release
Version 1.0.x is no longer available.

## Local dev / build instructions

For the 1.1.0 rewrite, I decided to use [Grunt](http://gruntjs.com/) to handle all the nagging tasks like JS minification,
bundling, requireJS module optimization and for generating env-specific index files to allow switching between local and
prod configurations. Grunt's pretty damned amazing once you get it all hooked up, but there's a little bit of a learning
curve at the start.

First, download [Node](http://nodejs.org/), which should include the Node Package Manager (NPM). This is pretty
painless but involves a bit of googling. It runs fine on Mac + Windows.

After checking out this repo, in your command line go to the root folder and type the following:

`npm install`
This command will look at the `package.json` file and ensure that all dependencies have been downloaded and are available.
It creates a node_modules folder. Don't bother checking that in.

`grunt dev`
`grunt prod`
Running either of these commands will execute the default tasks specified in your `gruntfile.js` to set up the particular
environment.

In addition to doing the bundling of some core JS files, executing this command also *re-generates your index.php file*.
This is important! To allow the script to run in both DEV and PROD modules (one without any bundling, one with), the
`grunt-template` task re-generates the index.php file from `index.template.tpl`. To change this from PROD to DEV, just
run `grunt dev`.

### Misc notes
- James Burke (requireJS author) recommends using a custom build folder when running the optimizer, since it can overwrite
files if you're not careful. While I generally agree, I didn't do this here: the grunt task generates a custom
`core/appStart-min.js`, bundled file of all the JS modules, then the `grunt-template` task handles re-generation of the main
index file to link to that file instead of the unbundled `app-start.jsx` file.
- The checked-in code should always be production ready, so I can just do a simple `git pull` on the main website to get
the latest content.

If there are any instructions missing here, let me know in the issues list or just fork the project and fix it.

Thanks!

Ben Keen
[@vancouverben](https://twitter.com/#!/vancouverben)
