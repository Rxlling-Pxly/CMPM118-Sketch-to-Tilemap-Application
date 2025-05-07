import Phaser from "../../lib/PhaserModule.js";
import TILEMAP from "./TILEMAP.js";
import Demo_WFC from "./Demo_WFC.js";
import HouseDataMiner from "../5_Utility/HouseDataMiner.js";
import Autotiler from "./Autotiler.js";

export default function initPhaser() {
  window.game = new Phaser.Game({
    parent: "phaser",
    type: Phaser.CANVAS,
    width: TILEMAP.WIDTH * TILEMAP.TILE_WIDTH,
    height: TILEMAP.HEIGHT * TILEMAP.TILE_WIDTH,
    zoom: 1,
    //autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,	// comment out this line to not center
    render: { pixelArt: true },	// scale pixel art without blurring
    scene: [Autotiler]
  });
}