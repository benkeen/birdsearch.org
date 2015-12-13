const LANG = {

	// header
	about: "Sur",

	// main panel
	map: "Carte",
	locations: "Emplacements",
	bird_species: "Espèces d'oiseaux",
	notable_sightings: "Observations remarquables",
	species: "Espèce",
	date: "Date",
	scientific_name: "Nom scientifique",
	reported_by: "Rapporté par",
	sightings: "Observations",
	last_seen: "Dernière visite",
	days: "jours",
	day: "jour",
	locations_seen: "Lieux vus",
	num_reported: "# visite",
	last: "denier",
	seen_at: "vu à",
	status: "Statut",
	confirmed: "Confirmé",
	reviewed: "Examiné",
	not_reviewed: "Pas examiné",

	// sidebar
	bird_sightings: "Observations d'oiseaux",
	popular_birding_locations: "Endroits populaires",
	more_search_options: "Plus d'options &raquo;",
	hide_search_options: "&laquo; Masquer les options de recherche",
	location: "Emplacement",
	select_unselect_all: "Sélectionner / Désélectionner tous",
	show_obs_made_within_last: "Afficher observations faites dans la dernière",
	day_or_days: "jour(s)",
	limit_to_locations: "Limiter aux endroits avec les observations faites dans les",
	search: "Rechercher",
	please_enter_location_search_default: "Entrer un emplacement",
	please_enter_location: "S'il vous plaît entrer un emplacement.",
	please_select_location_from_dropdown: "S'il vous plaît sélectionnez un emplacement dans le champ Emplacement auto-complété.",
	please_enter_more_specific_location: "S'il vous plaît entrer une localisation plus précise.",
	num_species_seen_at_location: "1% des espèces d'oiseaux observées à cet endroit dans le dossier% 2 derniers jours.",
	no_results_found: "Aucun résultat",
	count: "Nom",

	// about dialog
	contact: "Contacter",
	about_birdsearch: "Sur birdsearch.org",
	thanks: "Merci!",
	contact_me_para: "J'ai trouvé un bug? Vous avez une idée sur la façon d'améliorer ce site? J'aimerais vous entendre.",
	about_para1: "J'ai écrit ce site à remplir ce que je considérais comme une lacune assez remarquable dans la fonctionnalité de l'amazing %1 site.",
	about_para2: "Comme un ornithologue amateur, je veux un simple aperçu de haut niveau d'une région: où sont les lieux d'observation des oiseaux populaires? Qui spots rapportent le plus d'oiseaux? Qu'est-ce raretés sont d'être repéré dans ma région, et où? Ce site a tenté d'aider à combler cette lacune.",
	about_para3: "Cependant, un mois après, j'ai publié il, Cornell Lab a publié son excellent %1 caractéristique qui améliore de beaucoup de ce que vous voyez ici. Mais aucun regret! Ce fut une expérience intéressante, et je trouve encore l'interface utilisateur alternative offerte ici plus pratique de certaines façons. Alors, profitez-en!",
	about_para4: "Tout le code source de ce site est gratuit et open source et disponible sur %1.",
	make_comment: "Ajouter un commentaire sur <a href=\"http://www.benjaminkeen.com/ebirdsearch-org/\">ce post</a>, ou envoyez-moi à <a href=\"mailto:ben.keen@gmail.com\">ben.keen@gmail.com</a>.",
	have_fun: "Amusez-vous!",
	close: "Fermer",
	thanks_homies: "Merci!",
	thanks_blurb: "Ce site est presque entièrement JS, CSS + HTML, avec un couple de pages côté serveur (PHP) jetés pour gérer la conversion de eBird données API en JSON. Ce qui suit est une liste de tous les scripts open source et les ressources utilisées. A <b>grand</b> merci à tous les développeurs pour vos travaux. Vous roche.",
	thanks_footer: "Enfin, <span class=\"cornellThanks\"> un grand merci à la <b>Cornell Lab of Ornithology</b> pour créer leur <a href=\"https://confluence.cornell.edu/display/CLOISAPI/eBird+API+1.1\" target=\"blank\">API publique</a></span>, ce qui rend ce site possible.",
	help_translate: "Aider à Traduire",
	translate_para1: "Si vous êtes intéressé à aider à traduire ce site, je serais ravi de vous entendre! Les langues actuellement disponibles sont tous générés via Google Translate, donc ils sont probablement assez faible qualité. Tout le code source de ce site (texte inclus) se trouve sur <a href=\"https://github.com/benkeen/birdsearch.org\" target=\"_blank\">github, ici</a>. Tout ce que vous devez faire est de \"fork\" le dépôt (c.- à faire une copie de celui-ci), ajouter ou modifier un <a href=\"https://github.com/benkeen/birdsearch.org/tree/master/lang\">fichier de traduction</a> et de le renvoyer à moi par un \"pull request\".",
	translate_para2: "Il semble un peu technique, mais c'est en fait extrêmement simple. Si vous avez des questions, n'hésitez pas à <a href=\"mailto:ben.keen@gmail.com\">-moi une ligne</a>! :)",

	// help tab
	help: "Aide",
	help_para1: "Ce site vous permet de parcourir observations d'oiseaux que les gens ont soumis à <a href=\"http://ebird.org\" target=\"_blank\">eBird.org</a>. Il fonctionne dans le monde entier, mais les résultats dépendent des rapports dans cette région. Vous ne trouvez pas de résultats dans votre région? Puis <a href=\"http://ebird.org/content/ebird/about/\" target=\"_blank\">jointure eBird</a> et soumettre vos observations!",
	help_para2: "Recherche s'effectue à travers les champs dans la barre latérale gauche. Voilà ce que signifie chaque champ.",
	location_search_field: "Localisation champ de recherche",
	help_para3: "Entrez l'emplacement où vous êtes intéressé par la recherche. Commencez à taper, puis sélectionnez l'emplacement dans le menu déroulant pré-remplie qui apparaît. Note: vous pouvez <i>pas choisir des pays entiers</i>. Pour des raisons de performances, il ne montrera pas très grandes régions: la place, sélectionner une ville / commune ou adresse.",
	search_options: "Options de recherche",
	help_search_type_bird_sightings: "<span class=\"helpSearchType\">Observations d'oiseaux</span> retourner toutes les observations d'oiseaux dans cette région. Note: ce ne sont que des observations faites dans les établissements signalés comme \"hotspots\" dans le système eBird. Malheureusement, c'est actuellement une limitation à leur API.",
	help_search_type_notable_sightings: "<span class=\"helpSearchType\">Observations remarquables</span> sont les observations signalées comme rares ou inhabituels pour ce lieu à cette date.",
	help_search_type_popular_birding_locations: "<span class=\"helpSearchType\">Populaire ornithologie endroits</span> répertorie tous les sites d'observation des oiseaux dans une région où les observations ont été rapportées.",
	more_search_options2: "Plus d'options de recherche",
	help_para4: "Si vous cliquez sur le \"plus d'options de recherche\" lien, une nouvelle section va glisser ouvert qui offre un peu plus de contrôle sur votre recherche. Les options supplémentaires changent en fonction de votre type de recherche.",

	// map
	view_bird_species: "Voir les espèces d'oiseaux observées à cet endroit",
	view_full_info: "Voir une information complète",

	// footer
	site_not_affiliated_with_ebird: "Tous courtoisie de données %1"
};

export default LANG;
