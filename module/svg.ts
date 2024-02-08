const cache = new Map<string, SVGCache>();

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
}

export async function getSvg(src: string): Promise<SVGSVGElement> {
  let response: string;
  if (!cache.has(src)) {
    const cacheItem = new SVGCache(fetch(src));
    cache.set(src, cacheItem);
    await cacheItem.await();
    response = cacheItem.data;
  }
  else {
    const cacheItem = cache.get(src);
    await cacheItem.await();
    response = cacheItem.data;
  }
  
  const doc = new DOMParser();
  const svg = doc.parseFromString(response, "image/svg+xml").querySelector("svg");
  return svg;
}

export async function getIcon(src: string): Promise<SVGSVGElement> {
  return getSvg(`/framework/module/icons/${src}`);
} 
