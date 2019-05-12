# birdsearch.org

> Alas, alack, Cornell changed their API a little while back. So while the site still functions, it's gotten a little glitchy here and there. On the bright side, in the years since I created this app, eBird has been much improved. And while it still doesn't offer quite the same UX for giving high-level overviews for a region like birdsearch.org it's a lot better. I doubt I will update this script again.

Like many birders I know, discovering [eBird.org](http://ebird.org) was a cause for celebration. It brought birding 
out of the dark ages of pen and pencil and into the digital age. Now we have a simple, centralized place to track 
observations, share knowledge and open up the data for everyone.

But as a birder, I wanted a no-fuss high-level overview of a region; I wanted to see all observations being made in 
an area <i>right now</i>. The search options available on eBird are excellent, but don't quite fit the bill. This 
site was written to plug the gap. 

This is now the third incarnation of this script. The first was a quick hack to test out their API and get a feel 
for what I could do with the data. The second (1.1.0) was a re-write to add in some new functionality and to use 
requireJS and other technologies. The latest version (Oct, 2016) was another complete rewrite, this time using 
React, Redux, react-intl, Node.

## Versions

### v2.3.1 - Nov 17th, 2018 
- Converted build process to webpack;
- fixed bug with broken checklist link by removing checklist links :( eBird API no longer passes the checklist ID so we
can no longer link to it for results.

### v2.3.0 - Nov 9th, 2018 
- Updated for eBird API v2 (not all API called updated; only the broken ones).

### v2.2.0 - Mar 25th, 2018 
- A few styling updates for mobile: better scrolling, better spacing for bird tab content.

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
