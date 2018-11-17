import * as helpers from '../src/core/helpers';

const data = [
	{ title: 'The title', value: 4 },
	{ title: 'Another title', value: 1 },
	{ title: 'Aardvarks', value: 1000 },
	{ title: 'Aardman', value: 1001 },
	{ title: 'Zebra', value: 60 },
	{ title: 'Ponies', value: -5 }
];


describe('sortNumeric', () => {
	test('sort by number ASC', () => {
		expect(helpers.sortNumeric(data, (obj) => obj.value)).toEqual([
			{ title: 'Ponies', value: -5 },
			{ title: 'Another title', value: 1 },
			{ title: 'The title', value: 4 },
			{ title: 'Zebra', value: 60 },
			{ title: 'Aardvarks', value: 1000 },
			{ title: 'Aardman', value: 1001 }
		]);
	});

	test('sort by number DESC', () => {
		expect(helpers.sortNumeric(data, (obj) => -obj.value)).toEqual([
			{ title: 'Aardman', value: 1001 },
			{ title: 'Aardvarks', value: 1000 },
			{ title: 'Zebra', value: 60 },
			{ title: 'The title', value: 4 },
			{ title: 'Another title', value: 1 },
			{ title: 'Ponies', value: -5 }
		]);
	});
});


describe('sortAlpha', () => {
	test('sort by string, alphabetically', () => {
		expect(helpers.sortAlpha(data, (obj) => obj.title)).toEqual([
			{ title: 'Aardman', value: 1001 },
			{ title: 'Aardvarks', value: 1000 },
			{ title: 'Another title', value: 1 },
			{ title: 'Ponies', value: -5 },
			{ title: 'The title', value: 4 },
			{ title: 'Zebra', value: 60 }
		]);
	});

	test('sort by string, reverse alphabetically', () => {
		expect(helpers.sortAlpha(data, (obj) => obj.title, 'DESC')).toEqual([
			{ title: 'Zebra', value: 60 },
			{ title: 'The title', value: 4 },
			{ title: 'Ponies', value: -5 },
			{ title: 'Another title', value: 1 },
			{ title: 'Aardvarks', value: 1000 },
			{ title: 'Aardman', value: 1001 }
		]);
	});
});
