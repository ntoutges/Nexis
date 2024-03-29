const cache = new Map<string, SVGCache>();
const maps = new Map<string, string>();

export class SVGCache {
  private _data: string = null;
  private awaitListeners: Array<() => void> = [];
  constructor(fetch: Promise<Response>) {
    fetch.then(data => {
      data.text().then(this.fulfill.bind(this));
    })
  }

  private fulfill(response: string) {
    this._data = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,""); // replace removes script tags (like that injected by live-server);
    while (this.awaitListeners.length > 0) {
      this.awaitListeners.pop()(); // empty queue
    }
  }

  await(): Promise<void> {
    return new Promise(resolve => {
      if (this._data != null) resolve();
      this.awaitListeners.push(resolve);
    });
  }

  get data() { return this._data; }
  get parsedData() {
    const doc = new DOMParser();
    return doc.parseFromString(this._data, "image/svg+xml") as unknown as SVGSVGElement;
  }
}

async function getSvgCache(src: string): Promise<SVGCache> {
  if (!cache.has(src)) {
    // create new cache item
    const cacheItem = new SVGCache(fetch(src));
    cache.set(src, cacheItem);
  }

  // wait for cacheitem to get data
  const cacheItem = cache.get(src);
  await cacheItem.await();
  return cacheItem;
}

// in the form of <category>.<name> or <uri>
export async function getSvg(srcString: string): Promise<SVGSVGElement>
export async function getSvg(srcStrings: string[]): Promise<SVGSVGElement[]>
export async function getSvg(srcString: string | string[]): Promise<SVGSVGElement | SVGSVGElement[]> {
  if (Array.isArray(srcString)) return Promise.all(srcString.map(src => getSvg(src)));

  const srcArr = srcString.split(".");

  if (srcArr.length < 2) { // no category given
    return (await getSvgCache(srcString)).parsedData;
  }

  const category = srcArr[0];
  const name = srcArr[1];
  
  if (!maps.has(category)) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.height = "0px";
    svg.style.width = "0px";
    return svg;
  }

  // load from map
  const mapSrc = maps.get(category);
  const cacheItem = cache.get(mapSrc);

  await cacheItem.await();
  const symbol = cacheItem.parsedData.querySelector("#" + name);
  const attributes = symbol.attributes;
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (let i = 0; i < attributes.length; i++) {
    const name = attributes[i].name
    if (name == "id") continue; // ignore id

    svg.setAttribute(name, attributes[i].value);
  }
  svg.append(...symbol.childNodes); // append all children
  return svg;
}

// loads in a single file containing all the svgs
export async function loadSvgMap(src: string, category: string): Promise<void> {
  if (maps.has(category)) return; // no need to load anything in!

  maps.set(category, src); // map between category name and src
  await getSvgCache(src); // load in svg, and save into cache
}

loadSvgMap("/module/icons/icons.min.svg", "icons"); // default icon map, always loaded
