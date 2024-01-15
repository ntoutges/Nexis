
// minimizes the used layers
export class Layers<T> {
  private readonly layers: T[] = [];
  private readonly subLayers = new Map<number,T[]>();
  private readonly callbacks: Array<(type: T, zIndex: number) => void> = [];

  // by default, adds to top
  add(type: T, layerI:number=0) {
    const exists = this.layers.indexOf(type) != -1;
    if (exists) { // already exists
      this.moveToTop(type);
      return;
    }
    
    let nextLayer = null;
    for (const key of this.subLayers.keys()) {
      if (key > layerI && (nextLayer == null || key < nextLayer)) {
        nextLayer = key;
      }
    }
    
    let index = this.layers.length;
    if (nextLayer != null) { // must push to specific location
      index = this.layers.indexOf(this.subLayers.get(nextLayer)[0]);
      this.layers.splice(index,0,type);
    }
    else { // no layer after, push to end
      this.layers.push(type);
    }

    if (!this.subLayers.has(layerI)) this.subLayers.set(layerI, []);
    const sublayer = this.subLayers.get(layerI);
    sublayer.push(type);

    this.doUpdateGlobal(index);
  }

  remove(type: T) {
    const [layerI,sublayerI,index] = this.getLayerData(type);
    if (index == -1) return;

    const sublayer = this.subLayers.get(layerI);

    this.layers.splice(index,1);
    sublayer.splice(sublayerI,1);
    if (sublayer.length == 0) this.subLayers.delete(layerI); // remove empty layer

    this.doUpdateGlobal(index);
  }

  // move to front of current layer
  setLayer(type: T, layerI: number) {
    this.remove(type); // remove from old
    this.add(type, layerI); // add to new
  }

  moveToTop(type: T) {
    const [layerI,sublayerI,index] = this.getLayerData(type);
    
    const sublayer = this.subLayers.get(layerI);
    if (index == -1 || sublayerI == sublayer.length-1) return; // cannot move any further up
    
    const items = this.subLayers.get(layerI);
    const lastIndex = this.layers.indexOf(items[items.length-1]);

    // remove
    this.layers.splice(index,1);
    sublayer.splice(sublayerI,1);


    // push to front 
    this.layers.splice(lastIndex,0,type);
    sublayer.push(type);
    
    this.doUpdate(layerI, sublayerI);
  }

  moveToBottom(type: T) {
    const [layerI,sublayerI,index] = this.getLayerData(type);

    const sublayer = this.subLayers.get(layerI);
    if (index == -1 || sublayerI == 0) return; // cannot move any further down
    
    // remove
    this.layers.splice(index,1);
    sublayer.splice(sublayerI,1);

    // push to back 
    this.layers.splice(0,0,type);
    sublayer.splice(0,0,type);
    
    this.doUpdate(layerI, 0, sublayerI);
  }

  moveUp(type: T) {
    const [layerI,sublayerI,index] = this.getLayerData(type);

    const sublayer = this.subLayers.get(layerI);
    if (index == -1 || sublayerI == sublayer.length-1) return; // cannot move any further up
    
    // remove
    this.layers.splice(index,1);
    sublayer.splice(sublayerI,1);

    // push to front 
    this.layers.splice(index+1,0,type);
    sublayer.splice(sublayerI+1,0,type);
    
    this.doUpdate(layerI, sublayerI,sublayerI+1);
  }

  moveDown(type: T) {
    const [layerI,sublayerI,index] = this.getLayerData(type);

    const sublayer = this.subLayers.get(layerI);
    if (index == -1 || sublayerI == sublayer.length-1) return; // cannot move any further up
    
    // remove
    this.layers.splice(index,1);
    sublayer.splice(sublayerI,1);

    // push to back 
    this.layers.splice(index-1,0,type);
    sublayer.splice(sublayerI-1,0,type);
    
    this.doUpdate(layerI, sublayerI-1, sublayerI);
  }

  onMove(callback: (type: T, zIndex: number) => void) {
    this.callbacks.push(callback);
  }

  private doUpdate(sublayerI: number, startI: number, endI:number=null) {
    if (endI == null) endI = (this.subLayers.get(sublayerI)?.length-1) ?? -1;
    const sublayer = this.subLayers.get(sublayerI);
    for (let i = startI; i <= endI; i++) {
      const type = sublayer[i];
      this.callbacks.forEach((callback) => {
        callback(type, i);
      });
    }
  }

  private doUpdateGlobal(startI: number, endI:number=this.layers.length-1) {
    for (let i = startI; i <= endI; i++) {
      const type = this.layers[i];
      this.callbacks.forEach((callback) => {
        callback(type, i);
      });
    }
  }

  private getLayerData(type: T): [layer:number, subLayer:number, index:number] {
    for (const [i, subLayer] of this.subLayers.entries()) {
      const index = subLayer.indexOf(type);
      if (index != -1) {
        return [
          i,  // each layer contains sublayers // this is that sublayer
          index, // each sublayer contains multiple types // this is the position of the [type] in local sublayer space
          this.layers.indexOf(type) // this is the position of the [type] in global space
        ];
      }
    }
    return [-1,-1,-1];
  }
}