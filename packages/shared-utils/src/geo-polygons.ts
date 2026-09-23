export const MAJOR_CITIES = {
	SAN_FRANCISCO: {
		name: "San Francisco",
		lat: 37.7749,
		lng: -122.4194,
		radius: 100,
	},
	NEW_YORK: {
		name: "New York",
		lat: 40.7128,
		lng: -74.006,
		radius: 100,
	},
	LOS_ANGELES: {
		name: "Los Angeles",
		lat: 34.0522,
		lng: -118.2437,
		radius: 100,
	},
	CHICAGO: {
		name: "Chicago",
		lat: 41.8781,
		lng: -87.6298,
		radius: 100,
	},
	SEATTLE: {
		name: "Seattle",
		lat: 47.6062,
		lng: -122.3321,
		radius: 100,
	},
	BOSTON: {
		name: "Boston",
		lat: 42.3601,
		lng: -71.0589,
		radius: 100,
	},
	DENVER: {
		name: "Denver",
		lat: 39.7392,
		lng: -104.9903,
		radius: 150,
	},
	AUSTIN: {
		name: "Austin",
		lat: 30.2672,
		lng: -97.7431,
		radius: 100,
	},
	MIAMI: {
		name: "Miami",
		lat: 25.7617,
		lng: -80.1918,
		radius: 100,
	},
	ATLANTA: {
		name: "Atlanta",
		lat: 33.749,
		lng: -84.388,
		radius: 100,
	},
	BERLIN: {
		name: "Berlin",
		lat: 52.52,
		lng: 13.405,
		radius: 80,
	},
	MUNICH: {
		name: "Munich",
		lat: 48.1351,
		lng: 11.582,
		radius: 60,
	},
};

const NORTH_AMERICA_POLYGON = {
	coordinates: [
		[
			[-97.1991348, 25.4429646],
			[-84.0155411, 29.1134754],
			[-83.5360909, 23.5436878],
			[-76.944294, 25.7403745],
			[-80.1323032, 31.4567093],
			[-73.6923409, 35.9422968],
			[-49.9201584, 48.9098646],
			[-63.4707642, 69.8824123],
			[-171.366806, 71.4494737],
			[-175.2913284, 60.3700895],
			[-189.8015213, 52.4158226],
			[-163.9874268, 48.094133],
			[-134.5935059, 47.2260968],
			[-131.1156464, 43.4025531],
			[-117.952652, 31.5972526],
			[-107.8788757, 30.3764296],
			[-97.5232315, 25.0137509],
			[-97.1991348, 25.4429646],
		],
	],
	type: "Polygon",
};

const EUROPE_POLYGON = {
	coordinates: [
		[
			[-7.1630859, 35.5679805],
			[11.2060547, 37.6838203],
			[33.5742188, 32.5838493],
			[42.7505493, 73.4548416],
			[-17.0150757, 72.843439],
			[-29.6713257, 62.3110272],
			[-7.6986694, 35.5361376],
			[-7.1630859, 35.5679805],
		],
	],
	type: "Polygon",
};

const AFRICA_POLYGON = {
	coordinates: [
		[
			[-11.759491, 32.2148344],
			[20.584259, 33.9818016],
			[32.0100403, 32.3634333],
			[52.2427368, 10.2331674],
			[48.3755493, -28.9943278],
			[18.1411743, -38.8872916],
			[-3.8314819, -5.8735508],
			[-23.6947632, 17.0613797],
			[-11.3900757, 32.772842],
			[-11.759491, 32.2148344],
		],
	],
	type: "Polygon",
};

const INDIA_REGION_POLYGON = {
	coordinates: [
		[
			[48.7010193, 41.3469175],
			[74.540863, 1.8934236],
			[113.5643005, 14.2257822],
			[104.5994568, 43.1681275],
			[48.7010193, 41.4787469],
			[48.7010193, 41.3469175],
		],
	],
	type: "Polygon",
};

const AUSTRALIA_REGION_POLYGON = {
	coordinates: [
		[
			[92.2947693, 7.1485867],
			[147.3143005, 13.8847454],
			[187.743988, -36.9114703],
			[174.7361755, -50.6503312],
			[115.4978943, -45.9788323],
			[91.9432068, 6.1009564],
			[92.4705505, 7.322968],
			[92.2947693, 7.1485867],
		],
	],
	type: "Polygon",
};

const LATIN_AMERICA_POLYGON = {
	coordinates: [
		[
			[-89.3490601, 12.2558052],
			[-83.7240601, 23.3640045],
			[-64.2123413, 20.7577191],
			[-44.0077972, 6.7143914],
			[-28.5390472, -9.7462796],
			[-46.4687347, -48.1912678],
			[-55.2577972, -58.4214937],
			[-81.2734222, -57.8648448],
			[-89.1835785, 10.7098639],
			[-89.3593597, 12.4318828],
			[-89.3490601, 12.2558052],
		],
	],
	type: "Polygon",
};

const MEXICO_POLYGON = {
	coordinates: [
		[
			[-86.7041016, 19.6425875],
			[-94.8779297, 11.4800246],
			[-112.3455048, 19.3571458],
			[-119.0279388, 31.860355],
			[-87.9785156, 27.2936892],
			[-86.3964844, 19.9733488],
			[-86.7041016, 19.6425875],
		],
	],
	type: "Polygon",
};

const ASIA_POLYGON = {
	coordinates: [
		[
			[33.5, 27.5],
			[34.0, 32.3],
			[36.6, 36.6],
			[44.8, 37.0],
			[48.0, 39.5],
			[54.0, 42.5],
			[80.0, 42.5],
			[85.0, 53.0],
			[149.0, 53.0],
			[149.0, 4.0],
			[60.0, 4.0],
			[43.0, 11.0],
			[33.5, 27.5],
		],
	],
	type: "Polygon",
};

function isPointInPolygon(point: [number, number], polygon: number[][][]): boolean {
	const [x, y] = point;
	let inside = false;

	const ring = polygon[0];

	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const [xi, yi] = ring[i];
		const [xj, yj] = ring[j];

		const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}

	return inside;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function getNearestMajorCity(
	lat: number | null,
	lng: number | null,
): { lat: number; lng: number; name: string } | null {
	if (!lat || !lng) return null;

	for (const city of Object.values(MAJOR_CITIES)) {
		const distance = calculateDistance(lat, lng, city.lat, city.lng);
		if (distance <= city.radius) {
			return { lat: city.lat, lng: city.lng, name: city.name };
		}
	}

	return null;
}

export function isInNorthAmerica(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], NORTH_AMERICA_POLYGON.coordinates);
}

export function isInEurope(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], EUROPE_POLYGON.coordinates);
}

export function isInAfrica(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], AFRICA_POLYGON.coordinates);
}

export function isInIndiaRegion(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], INDIA_REGION_POLYGON.coordinates);
}

export function isInAustraliaRegion(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], AUSTRALIA_REGION_POLYGON.coordinates);
}

export function isInLatinAmerica(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], LATIN_AMERICA_POLYGON.coordinates);
}

export function isInMexico(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], MEXICO_POLYGON.coordinates);
}

export function isInAsia(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isPointInPolygon([lng, lat], ASIA_POLYGON.coordinates);
}

export function isInTargetRegion(lat: number | null, lng: number | null): boolean {
	if (!lat || !lng) return false;
	return isInNorthAmerica(lat, lng) || isInEurope(lat, lng);
}

export type ContinentName =
	| "NORTH_AMERICA"
	| "EUROPE"
	| "AFRICA"
	| "INDIA"
	| "ASIA"
	| "AUSTRALIA_OCEANIA"
	| "LATIN_AMERICA";

const CONTINENT_COUNTRIES: Record<ContinentName, string[]> = {
	NORTH_AMERICA: ["United States", "Canada", "Mexico"],
	EUROPE: [
		"Albania",
		"Andorra",
		"Armenia",
		"Austria",
		"Azerbaijan",
		"Belarus",
		"Belgium",
		"Bosnia and Herzegovina",
		"Bulgaria",
		"Croatia",
		"Cyprus",
		"Czech Republic",
		"Denmark",
		"Estonia",
		"Finland",
		"France",
		"Georgia",
		"Germany",
		"Greece",
		"Hungary",
		"Iceland",
		"Ireland",
		"Italy",
		"Kazakhstan",
		"Kosovo",
		"Latvia",
		"Liechtenstein",
		"Lithuania",
		"Luxembourg",
		"Malta",
		"Moldova",
		"Monaco",
		"Montenegro",
		"Netherlands",
		"North Macedonia",
		"Norway",
		"Poland",
		"Portugal",
		"Romania",
		"Russia",
		"San Marino",
		"Serbia",
		"Slovakia",
		"Slovenia",
		"Spain",
		"Sweden",
		"Switzerland",
		"Turkey",
		"Ukraine",
		"United Kingdom",
		"Vatican City",
	],
	AUSTRALIA_OCEANIA: ["Australia", "New Zealand"],
	AFRICA: ["Africa"],
	INDIA: ["India"],
	ASIA: [
		"Afghanistan",
		"Bahrain",
		"Bangladesh",
		"Bhutan",
		"Brunei",
		"Cambodia",
		"China",
		"Hong Kong",
		"Indonesia",
		"Iran",
		"Iraq",
		"Israel",
		"Japan",
		"Jordan",
		"Kuwait",
		"Kyrgyzstan",
		"Laos",
		"Lebanon",
		"Malaysia",
		"Maldives",
		"Mongolia",
		"Myanmar",
		"Nepal",
		"Oman",
		"Pakistan",
		"Philippines",
		"Qatar",
		"Saudi Arabia",
		"Singapore",
		"South Korea",
		"Sri Lanka",
		"Syria",
		"Taiwan",
		"Tajikistan",
		"Thailand",
		"Turkmenistan",
		"United Arab Emirates",
		"Uzbekistan",
		"Vietnam",
		"Yemen",
	],
	LATIN_AMERICA: [
		"Argentina",
		"Antigua and Barbuda",
		"Bahamas",
		"Barbados",
		"Belize",
		"Bolivia",
		"Brazil",
		"Chile",
		"Colombia",
		"Costa Rica",
		"Cuba",
		"Dominica",
		"Dominican Republic",
		"Ecuador",
		"El Salvador",
		"French Guiana",
		"Grenada",
		"Guatemala",
		"Guyana",
		"Haiti",
		"Honduras",
		"Jamaica",
		"Nicaragua",
		"Panama",
		"Paraguay",
		"Peru",
		"Puerto Rico",
		"Saint Kitts and Nevis",
		"Saint Lucia",
		"Saint Vincent and the Grenadines",
		"Suriname",
		"Trinidad and Tobago",
		"Uruguay",
		"Venezuela",
	],
};

export function getContinentForCoords(lat: number | null, lng: number | null): ContinentName | null {
	if (!lat || !lng) return null;

	if (isInMexico(lat, lng)) return "NORTH_AMERICA";
	if (isInNorthAmerica(lat, lng)) return "NORTH_AMERICA";
	if (isInEurope(lat, lng)) return "EUROPE";
	if (isInAustraliaRegion(lat, lng)) return "AUSTRALIA_OCEANIA";
	if (isInIndiaRegion(lat, lng)) return "INDIA";
	if (isInAfrica(lat, lng)) return "AFRICA";
	if (isInLatinAmerica(lat, lng)) return "LATIN_AMERICA";
	if (isInAsia(lat, lng)) return "ASIA";

	return null;
}

export function getCountriesForContinent(continent: ContinentName): string[] {
	return CONTINENT_COUNTRIES[continent];
}

export function getContinentForCountry(country: string): ContinentName | null {
	for (const continent of Object.keys(CONTINENT_COUNTRIES) as ContinentName[]) {
		if (CONTINENT_COUNTRIES[continent].includes(country)) return continent;
	}
	return null;
}
