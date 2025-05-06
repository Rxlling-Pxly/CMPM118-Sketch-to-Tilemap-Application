import Phaser from "../../lib/PhaserModule.js";
import WFCModel from "../2_WFC/1_Model/wfcModel.js";
import IMAGES from "../2_WFC/2_Input/images.js";
import TILEMAP from "./tilemap.js";
import getBoundingBox from "../3_Generators/getBoundingBox.js";
import generateHouse from "../3_Generators/generateHouse.js";
import generateForest from "../3_Generators/generateForest.js";

export default class Autotiler extends Phaser.Scene {
  constructor() {
    super("autotilerScene");
  }

  preload() {
    this.load.setPath("./assets/");
    this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
    this.load.tilemapTiledJSON("tinyTownMap", `maps/map1.tmj`);
  }

  create() {
    this.multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
    this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

    this.groundModel = new WFCModel();
    this.groundModel.learn(IMAGES.GROUND, 2);
    this.structsModel = new WFCModel();
    this.structsModel.learn(IMAGES.STRUCTURES, 2);

    window.addEventListener("generate", (e) => {
      const groundMapData = this.groundModel.generate(TILEMAP.WIDTH, TILEMAP.HEIGHT, 10, false, false);
      if (!groundMapData) throw new Error("Contradiction created");
      
      if (this.groundMap) this.groundMap.destroy();
      this.groundMap = this.make.tilemap({
        data: groundMapData,
        tileWidth: TILEMAP.TILE_WIDTH,
        tileHeight: TILEMAP.TILE_WIDTH
      });
      this.groundMap.createLayer(0, this.tileset, 0, 0);

      this.structsModel.clearSetTiles();

      for (const structure of Object.values(e.detail)) {
        if (!structure.strokes) continue;
        if (structure.strokes.length < 1) continue;

        if (structure.info.region == "box") {
          for (const stroke of structure.strokes) {
            const boundingBox = getBoundingBox(stroke);
            const struct = structure.info.type == "House" ? generateHouse(boundingBox) : generateForest(boundingBox);
            for (let y = 0; y < boundingBox.height; y++) {
            for (let x = 0; x < boundingBox.width; x++) {
              const dy = y + boundingBox.topLeft.y;
              const dx = x + boundingBox.topLeft.x;
              this.structsModel.setTile(dx, dy, struct[y][x]);
            }}
          }
        } else {
          for (const stroke of structure.strokes) {
            if (structure.info.type == "Fence") console.log("Fence generation not implemented yet");
            else console.log("Path generation not implemented yet");
          }
        }
      }

      const structsMapData = this.structsModel.generate(TILEMAP.WIDTH, TILEMAP.HEIGHT, 10, true, true);
      if (!structsMapData) throw new Error ("Contradiction created");

      if (this.structsMap) this.structsMap.destroy();
      this.structsMap = this.make.tilemap({
        data: structsMapData,
        tileWidth: TILEMAP.TILE_WIDTH,
        tileHeight: TILEMAP.TILE_WIDTH
      });
      this.structsMap.createLayer(0, this.tileset, 0, 0);

      console.log("Generation Complete");
    });
  }
}
