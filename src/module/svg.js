const cache = new Map();
export class SVGCache {
    _data = null;
    awaitListeners = [];
    constructor(fetch) {
        fetch.then(data => {
            data.text().then(this.fulfill.bind(this));
        });
    }
    fulfill(response) {
        this._data = response.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); // replace removes script tags (like that injected by live-server);
        while (this.awaitListeners.length > 0) {
            this.awaitListeners.pop()(); // empty queue
        }
    }
    await() {
        return new Promise(resolve => {
            if (this._data != null)
                resolve();
            this.awaitListeners.push(resolve);
        });
    }
    get data() { return this._data; }
}
export async function getSvg(src) {
    let response;
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
//# sourceMappingURL=svg.js.map