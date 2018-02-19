# birdsearch.org

Like many birders I know, discovering [eBird.org](http://ebird.org) was a cause for celebration. It brought birding 
out of the dark ages of pen and pencil and into the digital age. Now we have a simple, centralized place for openly 
tracking observations.

But as a birder, I wanted a no-fuss high-level overview of a region; I wanted to see all observations being made in 
an area <i>right now</i>. I wanted to be able to see at a glance a full list of species being sighted - not have to 
hunt around to construct a list manually. The search options available on eBird are great, but don't quite fit my 
needs. This site was written to plug the gap.

This is now the third incarnation of this site. The first was a quick hack to test out their API and get a feel 
for what I could do with the data. The second (1.1.0) was a re-write to add in some new functionality and to use 
requireJS and other technologies. The latest version (Oct, 2016) was a second rewrite and redesign, this time using 
React, Redux and Node.


## How to run locally 

Master is not currently stable, so you'll need to checkout the last commit of the last stable release.

1. Checkout the last tag: 
`git checkout 5db377bfafb5ceb8ece14641e3cc864d67dc5e4a`
2. npm install
3. grunt dev
4. node app.js (make sure you’re using node 6 or later)
5. Load up http://localhost:8080 in your browser 


## Versions

### v2.2.0 - Ongoing, Aug 2017
- Dependency updates
- speed improvements
- bug fixes

### v2.1.0 - Dec 11th, 2016
Mobile support.

### v2.0.0 - Oct 29th, 2016
New everything! New UI, new code. Rewritten in React, Redux with a node backend.

### v1.1.2
- bug fix for when you select an option from the dropdown, but it still tells you to select something when you submit
the form.
- cache-busting hash added to app-start JS file via Grunt.

### v1.1.x
This is a complete re-write of the script to better organize the code, improve the site design and add a little
functionality. It includes the following additions over 1.0.0:

- Three search types: "bird sightings", "notable sightings", "popular birding locations"
- advanced search functionality
- multi-language support
- more accurate results based on lat/lng instead of human addresses (but the interface still has a simple address
search)

### v1.0.x - initial release
Version 1.0.x is no longer available.


Ben Keen
[@vancouverben](https://twitter.com/#!/vancouverben)
