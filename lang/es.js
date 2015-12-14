const LANG = {
	// header
	about: "Acerca de",

	// main panel
	map: "Mapa",
	locations: "Ubicaciones",
	bird_species: "Especies de aves",
	notable_sightings: "Avistamientos notables",
	species: "Especies",
	date: "Fecha",
	scientific_name: "Nombre Científico",
	reported_by: "Reportado por",
	sightings: "Avistamientos",
	last_seen: "Visto por última vez",
	days: "días",
	day: "día",
	locations_seen: "Ubicaciones Visto",
	num_reported: "# Reportado",
	last: "último",
	seen_at: "visto en",
	status: "Estado",
	confirmed: "Confirmado",
	reviewed: "Opinión",
	not_reviewed: "Sin valoraciones",

	// sidebar
	bird_sightings: "Avistamiento de aves",
	popular_birding_locations: "Sugerencias de observación de aves",
	more_search_options: "Más opciones de búsqueda &raquo;",
	hide_search_options: "&laquo; Ocultar opciones de búsqueda",
	location: "Ubicación",
	select_unselect_all: "Seleccionar / Deseleccionar todo",
	show_obs_made_within_last: "Mostrar observaciones realizadas dentro de los últimos",
	day_or_days: "día(s)",
	limit_to_locations: "Limitar a los lugares con las observaciones realizadas dentro de los últimos",
	search: "Buscar",
	please_enter_location_search_default: "Por favor, introduzca una ubicación",
	please_enter_location: "Por favor, introduzca una ubicación.",
	please_select_location_from_dropdown: "Por favor, seleccione una ubicación en el campo de ubicación de auto-completado.",
	please_enter_more_specific_location: "Por favor, introduzca una ubicación más específica.",
	num_species_seen_at_location: "%1 avistamiento de aves en este lugar en los últimos %2 días.",
	no_results_found: "No hay resultados",
	count: "Contar",

	// about dialog
	contact: "Contacto",
	about_birdsearch: "Acerca birdsearch.org",
	thanks: "¡Gracias!",
	contact_me_para: "Encontrado un error? ¿Tienes una idea de cómo mejorar este sitio? Me encantaría saber de usted.",
	about_para1: "Escribí este sitio para llenar lo que consideraba como una brecha en lugar visible en la funcionalidad del %1 increíble sitio.",
	about_para2: "Como un observador de aves, quiero una simple descripción de alto nivel de una región: ¿dónde están los lugares de observación de aves populares? ¿Qué puntos de ceder el mayoría de los pájaros? ¿Qué rarezas están siendo avistados en mi región, y dónde? Este sitio intenta ayudar a tapar ese hueco.",
	about_para3: "Sin embargo, un mes después de que me liberé, Cornell Lab lanzó su %1 excelente característica que mejora en mucho de lo que usted ve aquí. Pero no me arrepiento! Este fue un experimento interesante, y me sigue pareciendo la interfaz de usuario alternativa que aquí se ofrecen más conveniente de cierta manera. Así que disfruten!",
	about_para4: "Todo el código fuente de esta página es libre y de código abierto y se encuentra en %1.",
	make_comment: "Hacer un comentario en <a href=\"http://www.benjaminkeen.com/ebirdsearch-org/\">este post</a>, o por correo electrónico me <a href=\"mailto:ben.keen@gmail.com\">ben.keen@gmail.com</a>.",
	have_fun: "Que se diviertan!",
	close: "Cerrar",
	thanks_homies: "¡Gracias!",
	thanks_blurb: "Este sitio web es casi en su totalidad JS, CSS + HTML, con un par de páginas del lado del servidor (PHP) tirado para manejar la conversión de datos de eBird API en JSON. La siguiente es una lista de todos los scripts de código abierto y los recursos utilizados. A <b>grande</b>, gracias a todos los desarrolladores para su trabajo. You rock. Que tu primer hijo sea un chico, y todo eso.",
	thanks_footer: "Por último, <span class=\"cornellThanks\">un enorme gracias a la <b>Cornell Lab of Ornithology</b> para la creación de su <a href=\"https://confluence.cornell.edu/display/CLOISAPI/eBird+API+1.1\" target=\"_blank\">API pública</a></span>, que hace posible este sitio.",
	help_translate: "Help Traducir",
	translate_para1: "Si usted está interesado en ayudar a traducir este sitio, me encantaría saber de usted! Los idiomas disponibles son generados a través de Google Translate, por lo que son probablemente muy baja calidad. Todo el código fuente de este sitio (texto incluido) se encuentra en <a href=\"https://github.com/benkeen/birdsearch.org\" target=\"_blank\">github, aquí</a>. Todo lo que necesitas hacer es \"tenedor\" el repositorio (es decir, hacer una copia de la misma), añadir o modificar un <a href=\"https://github.com/benkeen/birdsearch.org/tree/master/lang\">archivo de traducción</a> y enviar de nuevo a mí a través de un \"pull request\".",
	translate_para2: "Suena un poco técnico, pero en realidad es sumamente sencillo. Si usted tiene alguna pregunta, no dude en <a href=\"mailto:ben.keen@gmail.com\">mándenme una línea</a>! :)",

	// help tab
	help: "Ayudar",
	help_para1: "Este sitio le permite navegar por las observaciones de aves que la gente ha presentado a <a href=\"http://ebird.org\" target=\"_blank\">eBird.org</a>. Funciona en todo el mundo, pero los resultados dependen de los informes en esa región. Si no ves resultados en su área? Entonces <a href=\"http://ebird.org/content/ebird/about/\" target=\"_blank\">join eBird</a> y enviar sus observaciones!",
	help_para2: "La búsqueda se realiza a través de los campos en la barra lateral izquierda. Esto es lo que significa cada campo.",
	location_search_field: "Campo de búsqueda Localización",
	help_para3: "Introduzca la ubicación en la que está interesado en la búsqueda. Comience a escribir, a continuación, seleccione la ubicación en la lista desplegable rellenada previamente que aparece. Nota: No puede seleccionar <i>países enteros</i>. Por motivos de rendimiento, no se mostrará regiones muy grandes: en su lugar, seleccione una ciudad / pueblo o la dirección.",
	search_options: "Opciones de búsqueda",
	help_search_type_bird_sightings: "<span class=\"helpSearchType\">Bird avistamientos</span> volver todos los avistamientos de aves en la zona. Nota: éstos son sólo los avistamientos realizados en lugares marcados como \"hotspots\" en el sistema de eBird. Por desgracia, esta es actualmente una limitación de su API.",
	help_search_type_notable_sightings: "<span class=\"helpSearchType\">Avistamientos notables</span> son avistamientos marcado como rara o poco común para ese lugar en esa fecha.",
	help_search_type_popular_birding_locations: "<span class=\"helpSearchType\">Sugerencias de observación de aves</span> listas de todos los lugares de observación de aves en una región donde se han reportado avistamientos.",
	more_search_options2: "Más opciones de búsqueda",
	help_para4: "Si hace clic en el \"más opciones de búsqueda\" link, una nueva sección se deslizará abierto que proporciona un poco más de control sobre su búsqueda. Las opciones cambian según el tipo de búsqueda.",

	// map
	view_bird_species: "Ver el avistamiento de aves en este lugar",
	view_full_info: "Vea la información completa",

	// footer
	site_not_affiliated_with_ebird: "Todos los datos son cortesía del %1"
};

export { LANG };
