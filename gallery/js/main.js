const grid = new Muuri('.grid', {
	layout: {
		rounding: false
	}
});

window.addEventListener('load', () => {
	grid.refreshItems().layout();
	document.getElementById('grid').classList.add('uploaded-images');

	// Add listener of links for fileter
	const links = document.querySelectorAll('#categorie a');
	links.forEach( (element) => {
		element.addEventListener('click', (event) => {
			event.preventDefault();
			links.forEach((enlace) => enlace.classList.remove('active'));
			event.target.classList.add('active');
			
			const categorie = event.target.innerHTML.toLowerCase();
			categorie === 'all' ? grid.filter('[data-categorie]') : grid.filter(`[data-categorie="${categorie}"]`);
		});
	});

	// Add listener for search bar
	document.querySelector('#search-bar').addEventListener('input', (event) => {
		const busqueda = event.target.value;
		grid.filter((item) => item.getElement().dataset.tags.includes(busqueda));
	});
	
	// Add listener for images
	const overlay = document.getElementById('overlay');
	document.querySelectorAll('.grid .item img').forEach((element) => {
		element.addEventListener('click', () => {
			const route = element.getAttribute('src');
			const description = element.parentNode.parentNode.dataset.description;

			overlay.classList.add('active');
			document.querySelector('#overlay img').src = route;
			document.querySelector('#overlay .description').innerHTML = description;
		});
	});


	// Add Event listener of close bottom
	document.querySelector('#btn-close-overlay').addEventListener('click', () => {
		overlay.classList.remove('active');
	});

	// Event listener del overlay
	overlay.addEventListener('click', (event) => {
		event.target.id === 'overlay' ? overlay.classList.remove('active') : '';	
	});

	// Add dark mode
	// Change mode width switch
	const btnSwitch = document.querySelector('#switch');

	btnSwitch.addEventListener('click', () => {
		document.body.classList.toggle('dark');
		btnSwitch.classList.toggle('active');

		// Save the mode in localstorage
		if(document.body.classList.contains('dark')){
			localStorage.setItem('dark-mode', 'true');
		} else {
			localStorage.setItem('dark-mode', 'false');
		}
	});

	// Obtain actual mode
	if(localStorage.getItem('dark-mode') === 'true'){
		document.body.classList.add('dark');
		btnSwitch.classList.add('active');
	} else {
		document.body.classList.remove('dark');
		btnSwitch.classList.remove('active');
	}
});
