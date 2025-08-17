export class RateLimiter {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private requestsPerMinute: number;
  private requestsMade = 0;
  private lastResetTime = Date.now();

  constructor(requestsPerMinute: number) {
    this.requestsPerMinute = requestsPerMinute;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counter if a minute has passed
      if (Date.now() - this.lastResetTime >= 60000) {
        this.requestsMade = 0;
        this.lastResetTime = Date.now();
      }

      // If we've hit the rate limit, wait until the next minute
      if (this.requestsMade >= this.requestsPerMinute) {
        const waitTime = 60000 - (Date.now() - this.lastResetTime);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        this.requestsMade = 0;
        this.lastResetTime = Date.now();
      }

      const request = this.queue.shift();
      if (request) {
        this.requestsMade++;
        await request();
      }
    }

    this.processing = false;
  }

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }
}
