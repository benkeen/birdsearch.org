// ------------------------------------------------------------------------------------------------
// German language file
// ------------------------------------------------------------------------------------------------

const LANG = {
	// header
	about: "Diese Website",

	// main panel
	map: "Karte",
	locations: "Standorte",
	bird_species: "Vogelarten",
	notable_sightings: "Bemerkenswerte Beobachtungen",
	species: "Spezies",
	date: "Jahreszahl",
	scientific_name: "Wissenschaftlicher Name",
	reported_by: "Berichtet von",
	sightings: "Sichtungen",
	last_seen: "Zuletzt gesehen",
	days: "tage",
	day: "tag",
	locations_seen: "Standorte gesehen",
	num_reported: "# gemeldet",
	last: "letzte",
	seen_at: "gesehen bei",
	status: "Status",
	confirmed: "Bestätigt",
	reviewed: "Bewertet",
	not_reviewed: "Nicht bewertet",

	// sidebar
	bird_sightings: "Vogelbeobachtungen",
	popular_birding_locations: "Beliebte Standorte Vogelbeobachtung",
	more_search_options: "Mehr Suchoptionen &raquo;",
	hide_search_options: "&laquo; Suchoptionen ausblenden",
	location: "Stelle",
	select_unselect_all: "Aktivieren / deaktivieren Sie alle",
	show_obs_made_within_last: "Zeigen Beobachtungen innerhalb der letzten",
	day_or_days: "Tag(e)",
	limit_to_locations: "Beschränken auf Standorten mit Beobachtungen innerhalb der letzten",
	search: "Suchen",
	please_enter_location_search_default: "Bitte geben Sie einen Ort",
	please_enter_location: "Bitte geben Sie einen Ort.",
	please_select_location_from_dropdown: "Bitte wählen Sie einen Speicherort aus der Auto-Standort-Feld fertig.",
	please_enter_more_specific_location: "Bitte geben Sie einen bestimmten Ort.",
	num_species_seen_at_location: "%1 Vogelarten an dieser Stelle in den letzten %2 Tage(n) gesehen.",
	no_results_found: "Keine Ergebnisse gefunden",
	count: "Zählen",

	// about dialog
	contact: "Verbindung",
	about_birdsearch: "Über birdsearch.org",
	thanks: "Vielen Dank!",
	contact_me_para: "Einen Fehler gefunden? Haben Sie eine Idee, wie man diese Seite verbessern? Ich würde gerne von Ihnen hören.",
	about_para1: "Ich schrieb diese Seite zu füllen, was ich als eine eher auffällige Lücke in der Funktionalität der erstaunlichen %1 Website angesehen.",
	about_para2: "Als Vogelbeobachter, möchte ich eine einfache High-Level-Überblick über eine Region: Wo sind die beliebten Vogelbeobachtung Standorte? Welche Spots liefern die meisten Vögel? Welche Raritäten werden in meiner Region entdeckt, und wo? Diese Seite versucht, diese Lücke Stecker helfen.",
	about_para3: "Doch einen Monat, nachdem ich es freigegeben, freigegeben Cornell Lab ihre hervorragende %1 Funktion, die auf eine Menge von dem, was Sie hier sehen, verbessert. Aber keine Reue! Das war ein interessantes Experiment, und finde ich immer noch die alternative UI hier bequemer in gewisser Weise angeboten. So genießen Sie!",
	about_para4: "Der gesamte Quellcode für diese Seite ist kostenlos und Open Source und gefunden auf %1.",
	make_comment: "Machen Sie einen Kommentar zu <a href=\"http://www.benjaminkeen.com/ebirdsearch-org/\">diesem Beitrag</a>, oder mailen Sie mir an <a href=\"mailto:ben.keen@gmail.com\">ben.keen@gmail.com</a>",
	have_fun: "Viel Spaß!",
	close: "Schließen",
	thanks_homies: "Vielen Dank!",
	thanks_blurb: "Diese Webseite ist fast ausschließlich JS, CSS + HTML, mit ein paar Server-Side-Seiten (PHP) geworfen, um die Umwandlung von Daten in eBird API JSON behandeln. Das Folgende ist eine Liste aller Open-Source-Skripte und Ressourcen verwendet. A <b>big</b> Dank an alle Entwickler für Ihre Arbeit. Sie rocken. Möge dein erstes Kind eine männliche Kind zu sein, und das alles.",
	thanks_footer: "Schließlich <span class=\"cornellThanks\">ein großes Dankeschön an die <b>Cornell Lab of Ornithologie</b> für die Erstellung ihrer <a href=\"https://confluence.cornell.edu/display/CLOISAPI/eBird+API+1.1\" target=\"_blank\">öffentlichen API</a></span>, die diese Seite ermöglicht.",
	help_translate: "Hilfe Übersetzen",
	translate_para1: "Wenn Sie daran interessiert zu helfen, übersetzen diese Webseite sind, würde ich gerne von Ihnen hören! Die derzeit verfügbaren Sprachen sind alle über Google Translate erzeugt, so dass sie wahrscheinlich ziemlich schlechter Qualität. Der gesamte Quellcode für diese Website (Text enthalten) auf <a href=\"https://github.com/benkeen/birdsearch.org\" target=\"_blank\">github gefunden, hier</a>. Alles, was Sie tun müssen, ist \"fork\" das Repository (dh eine Kopie davon), Hinzufügen oder Ändern einer <a href=\"https://github.com/benkeen/birdsearch.org/tree/master/lang\">Übersetzung Datei</a> und senden Sie es zurück zu mir über eine \"Pull Request\".",
	translate_para2: "Es klingt ein wenig technisch, aber es ist tatsächlich überaus einfach. Wenn Sie irgendwelche Fragen haben, zögern Sie <a href=\"mailto:ben.keen@gmail.com\">kontaktieren Sie mich</a>! :)",

	// help tab
	help: "Hilfe",
	help_para1: "Auf dieser Website können Sie sehen, dass die Menschen Vogelbeobachtungen haben eingereicht <a href=\"http://ebird.org\" target=\"_blank\">eBird.org</a>. Es funktioniert weltweit, aber die Ergebnisse sind abhängig von den Berichten in dieser Region. Sie sehen keine Ergebnisse in Ihrer Nähe? Dann <a href=\"http://ebird.org/content/ebird/about/\" target=\"_blank\">Join eBird</a> und senden Sie Ihre Beobachtungen!",
	help_para2: "Die Suche wird durch die Felder in der linken Seitenleiste getan. Hier ist, was jedes Feld bedeutet.",
	location_search_field: "Ort Suchfeld",
	help_para3: "Geben Sie den Speicherort Sie interessiert bei der Suche. Beginnen Sie, und wählen Sie dann den Ort aus der Vor-besiedelte Dropdown, das erscheint. Hinweis: Sie können nicht wählen <i>ganze Länder</i>. Aus Performance-Gründen wird es nicht zeigen sehr große Regionen: Statt, wählen Sie eine Stadt / Gemeinde oder Adresse.",
	search_options: "Suchoptionen",
	help_search_type_bird_sightings: "<span class=\"helpSearchType\">Vogelbeobachtungen</span> zurückgeben alle Vogel-Sichtungen in diesem Bereich. Hinweis: dies sind nur Beobachtungen an Standorten Liste als \"Hotspots\" im eBird System vorgenommen. Leider ist dies derzeit eine Einschränkung mit ihren API.",
	help_search_type_notable_sightings: "<span class=\"helpSearchType\">Bemerkenswerte Beobachtungen</span> sind Sichtungen Liste als selten oder ungewöhnlich für diesen Ort zu diesem Zeitpunkt.",
	help_search_type_popular_birding_locations: "<span class=\"helpSearchType\">Beliebte Vogelbeobachtung Standorten</span> listet alle Vogelbeobachtung Standorten in einer Region, wo Sichtungen gemeldet wurden.",
	more_search_options2: "Mehr Suchoptionen",
	help_para4: "Wenn Sie auf den \"mehr Suchoptionen\"-Link, ein neuer Abschnitt gleitet offen, die ein wenig mehr Kontrolle über Ihre Suche bietet klicken. Die zusätzlichen Optionen ändern, je nach Art Ihrer Suche.",

	// map
	view_bird_species: "Sehen Vogelarten an diesem Ort gesehen",
	view_full_info: "Detaillierte Informationen",

	// footer
	site_not_affiliated_with_ebird: "Alle Daten mit freundlicher Genehmigung von %1"
};

export { LANG };
