import MAP1 from "./map1.js";
import MAP2 from "./map2.js";
import MAP3 from "./map3.js";
import MAP4 from "./map4.js";
import HOUSES from "./houses.js";

/** @type {{ GROUND: TilemapImage[], STRUCTURES: TilemapImage[], HOUSES: TilemapImage[], FORESTS: TilemapImage[] }} */
const IMAGES = {
	GROUND: [
		MAP1.GROUND,
		//MAP2.GROUND,
		//MAP3.GROUND,
		//MAP4.GROUND
	],
	STRUCTURES: [
		MAP1.STRUCTURES,
		MAP2.STRUCTURES,
		MAP3.STRUCTURES,
		//MAP4.STRUCTURES
	],
	HOUSES: [
		...MAP1.HOUSES,
		...MAP2.HOUSES,
		...MAP3.HOUSES,
		...HOUSES
		//HOUSES[HOUSES.length -1]
	],
	FORESTS: [
		...MAP1.FORESTS
	]
};
export default IMAGES;