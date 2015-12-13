// ------------------------------------------------------------------------------------------------
// English language file
// ------------------------------------------------------------------------------------------------

const LANG = {
	// header
	about: "About",

	// main panel
	map: "Map",
	locations: "Locations",
	bird_species: "Bird Species",
	notable_sightings: "Notable sightings",
	species: "Species",
	date: "Date",
	scientific_name: "Scientific Name",
	reported_by: "Reported by",
	sightings: "Sightings",
	last_seen: "Last Seen",
	days: "days",
	day: "day",
	locations_seen: "Locations Seen",
	num_reported: "# Reported",
	last: "last",
	seen_at: "seen at",
	status: "Status",
	confirmed: "Confirmed",
	reviewed: "Reviewed",
	not_reviewed: "Not reviewed",

	// sidebar
	bird_sightings: "Bird sightings",
	popular_birding_locations: "Popular birding locations",
	more_search_options: "More search options &raquo;",
	hide_search_options: "&laquo; Hide search options",
	location: "Location",
	select_unselect_all: "Select / Unselect all",
	show_obs_made_within_last: "Show observations made within last",
	day_or_days: "day(s)",
	limit_to_locations: "Limit to locations with observations made within last",
	search: "Search",
	please_enter_location_search_default: "Please enter a location",
	please_enter_location: "Please enter a location.",
	please_select_location_from_dropdown: "Please select a location from the auto-completed location field.",
	please_enter_more_specific_location: "Please enter a more specific location.",
	num_species_seen_at_location: "%1 bird species seen at this location in the last %2 days.",
	no_results_found: "No results found",
	count: "Count",

	// about dialog
	contact: "Contact",
	about_birdsearch: "About birdsearch.org",
	thanks: "Thanks!",
	contact_me_para: "Found a bug? Have an idea on how to improve this site? I'd love to hear from you.",
	about_para1: "I wrote this site to fill what I regarded as a rather conspicuous gap in the functionality of the amazing %1 site.",
	about_para2: "As a birder, I want a simple high-level overview of a region: where are the popular birding locations? Which spots yield the most birds? What rarities are being spotted in my region, and where? This site attempted to help plug that gap.",
	about_para3: "However, a month after I released it, Cornell Lab released their excellent %1 feature that improves on a lot of what you see here. But no regrets! This was an interesting experiment, and I still find the alternate UI offered here more convenient in certain ways. So enjoy!",
	about_para4: "All the source code for this site is free and open source and found on %1.",
	make_comment: "Make a comment on <a href=\"http://www.benjaminkeen.com/ebirdsearch-org/\">this post</a>, or email me at <a href=\"mailto:ben.keen@gmail.com\">ben.keen@gmail.com</a>.",
	have_fun: "Have fun!",
	close: "Close",
	thanks_homies: "Thanks, homies.",
	thanks_blurb: "This website is almost entirely JS, CSS + HTML, with a couple of server-side pages (PHP) thrown in to handle conversion of eBird API data into JSON. The following is a list of all the open source scripts and resources used. A <b>big</b> thanks to all the developers for your work. You rock. May your first child be a masculine child, and all that.",
	thanks_footer: "Lastly, <span class=\"cornellThanks\">a huge thanks to the <b>Cornell Lab of Ornithology</b> for creating their <a href=\"https://confluence.cornell.edu/display/CLOISAPI/eBird+API+1.1\" target=\"_blank\">public API</a></span>, which makes this site possible.",
	help_translate: "Help Translate",
	translate_para1: "If you're interested in helping translate this site, I'd love to hear from you! The currently available languages are all generated via Google Translate, so they're probably pretty low quality. All the source code for this site (text included) is found on <a href=\"https://github.com/benkeen/birdsearch.org\" target=\"_blank\">github, here</a>. All you need to do is \"fork\" the repository (i.e. make a copy of it), add or modify a <a href=\"https://github.com/benkeen/birdsearch.org/tree/master/lang\">translation file</a> and send it back to me via a \"pull request\".",
	translate_para2: "It sounds a little technical, but it's actually exceedingly simple. If you have any questions, feel free to <a href=\"mailto:ben.keen@gmail.com\">drop me a line</a>! :)",

	// help tab
	help: "Help",
	help_para1: "This site lets you browse bird observations that people have submitted to <a href=\"http://ebird.org\" target=\"_blank\">eBird.org</a>. It works worldwide, but the results depend on the reports in that region. Don't see any results in your area? Then <a href=\"http://ebird.org/content/ebird/about/\" target=\"_blank\">join eBird</a> and submit your sightings!",
	help_para2: "Searching is done through the fields in the left sidebar. Here's what each field means.",
	location_search_field: "Location search field",
	help_para3: "Enter the location you're interested in searching. Start typing, then select the location from the pre-populated dropdown that appears. Note: you <i>can't select entire countries</i>. For performance reasons, it won't show very large regions: instead, select a city/town or address.",
	search_options: "Search options",
	help_search_type_bird_sightings: "<span class=\"helpSearchType\">Bird sightings</span> return all bird sightings in that area. Note: these are only sightings made at locations flagged as \"hotspots\" within the Ebird system. Sadly, this is currently a limitation with their API.",
	help_search_type_notable_sightings: "<span class=\"helpSearchType\">Notable sightings</span> are sightings flagged as rare or unusual for that location at that date.",
	help_search_type_popular_birding_locations: "<span class=\"helpSearchType\">Popular birding locations</span> lists all birding locations in a region where sightings have been reported.",
	more_search_options2: "More Search Options",
	help_para4: "If you click on the \"more search options\" link, a new section will slide open that provides a little more control over your search. The additional options change depending on your search type.",

	// login / accounts
	login: "Login",

	// map
	view_bird_species: "View bird species seen at this location",
	view_full_info: "View full information",

	// footer
	site_not_affiliated_with_ebird: "Data courtesy of %1"
};

export default LANG;
