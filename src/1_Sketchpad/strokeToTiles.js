export class Regions {
  regionBlock = {
    box: (strokes) => this.getBoundingBox(strokes),
    trace: (strokes) => this.getTrace(strokes),
  };

  constructor(sketch, cellSize) {
    this.cellSize = cellSize;
    this.sketch = sketch;
  }

  // returns an object 
  //    properties  --> structure types               
  //    values      --> array of each structure's strokes 
  get() {
    let result = {};

    for (let structType in this.sketch) {
      let struct = this.sketch[structType];

      // only looking through structures (not other attributes) with points drawn
      if (struct.info && struct.strokes && struct.strokes.length > 1) {
        result[structType] = [];
        let regionType = struct.info.region;

        // group nearby strokes into a single stroke before defining region
        struct.strokes = this.groupNearby(struct.strokes);

        // define regions (box or trace) for every stroke of this structure
        for (let stroke of struct.strokes) {
          result[structType].push(
            this.regionBlock[regionType](stroke, struct.info.color)
          );
        }
      }
    }

    return result;
  }

  // takes an array of strokes and combines strokes within a threshold 
  //    from each other into a single stroke. Returns a new array with
  //    grouped strokes.
  groupNearby(strokes, threshold = 40) {
    const visited = new Array(strokes.length).fill(false);  // visit flags
    const result = [];

    // BFS
    for (let i = 0; i < strokes.length; i++) {
      if (visited[i]) continue;

      const group = [];     // current group
      const queue = [i];    // search queue
      visited[i] = true;    // mark index as visited

      while (queue.length > 0) {
        const current = queue.shift();
        group.push(...strokes[current]);    // add strokes to current group

        for (let j = 0; j < strokes.length; j++) {
          if (
            !visited[j] &&
            this.strokesNearby(strokes[current], strokes[j], threshold)
          ) {
            visited[j] = true;  // mark index as visited
            queue.push(j);      // add nearby stroke to search queue
          }
        }
      }

      result.push(group);       // add grouped strokes to array
    }

    return result;
  }

  // checkes is strokeA and strokeB are within threshold of one another
  strokesNearby(strokeA, strokeB, threshold) {
    const boxA = this.getBoundingBox(strokeA);
    const boxB = this.getBoundingBox(strokeB);

    return (
      boxA.min.x - threshold < boxB.max.x &&
      boxA.max.x + threshold > boxB.min.x &&
      boxA.min.y - threshold < boxB.max.y &&
      boxA.max.y + threshold > boxB.min.y
    );
  }

  // for "box" region types
  //    gets min x,y and max x,y of stroke to create a bounding bow region around stroke
  getBoundingBox(stroke) {
    if (!stroke) return;
    // console.log("getting bounding box...", stroke)
    const outputWidth = window.game.config.width / this.cellSize;
    const outputHeight = window.game.config.height / this.cellSize;

    let tiles = this.pointsToCells(stroke);

    // get top-left and bottom-right of stroke and fill in that region of tiles
    let min = { x: outputWidth, y: outputHeight };
    let max = { x: -1, y: -1 };
    for (let tile of tiles) {
      // top-left
      if (tile.x < min.x) {
        min.x = tile.x;
      }
      if (tile.y < min.y) {
        min.y = tile.y;
      }

      // bottom-right
      if (tile.x > max.x) {
        max.x = tile.x;
      }
      if (tile.y > max.y) {
        max.y = tile.y;
      }
    }

    min = { x: min.x * this.cellSize, y: min.y * this.cellSize };
    max = { x: max.x * this.cellSize, y: max.y * this.cellSize };

    return {
      min: min,
      max: max,
    };
  }

  // for "trace" region types
  //    returns an array of the the grid cells that stroke points pass through
  getTrace(stroke) {
    if (!stroke) return;
    console.log("getting region trace...", stroke);

    let result = this.pointsToCells(stroke);

    // normalized squares, triangles will have very few points.
    //    need to fill in-between tiles in these cases
    if (result.length < 5) {
      result = this.completeShape(result);
    }

    return result;
  }

  // uses linear interpolation to fill empty cells in shapes with few points 
  //    prevents squares, triangles, etc from being represented as just their angle points
  completeShape(points) {
    if (!points || points.length < 2) return points;

    const filled = [];

    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length]; // next point (wraps around for closed shape)

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      // linear interpolation between start and end
      for (let j = 0; j <= steps; j++) {
        const x = Math.round(start.x + (dx * j) / steps);
        const y = Math.round(start.y + (dy * j) / steps);

        filled.push({ x, y });
      }
    }

    return filled;
  }

  // converts canvas coordinates to grid cells
  pointsToCells(stroke) {
    let result = [];

    for (let point of stroke) {
      //console.log(getCell(point.x, point.y))
      result.push(this.getCell(point.x, point.y));
    }

    result = this.removeDuplicates(result);
    return result;
  }

  // finds which cell the point is in
  getCell(x, y) {
    return {
      x: Math.floor(x / this.cellSize),
      y: Math.floor(y / this.cellSize),
    };
  }

  // removes duplicates for array
  removeDuplicates(arr) {
    const uniqueArray = Array.from(
      new Set(arr.map((obj) => JSON.stringify(obj)))
    ).map((str) => JSON.parse(str));

    return uniqueArray;
  }
}
