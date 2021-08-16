type Task<T> = () => Promise<T>;

class Scheduler {
  pending: Task<unknown>[] = [];
  active: Promise<unknown> | undefined;

  fireNextTask() {
    const next = this.pending.shift();
    if (next) {
      this.active = next();
      this.active.then(() => {
        this.active = undefined;
        this.fireNextTask();
      });
    }
  }

  schedule<T>(task: Task<T>) {
    return new Promise((resolve) => {
      const innerTask = () => {
        const res = task();
        res.then((item) => resolve(item));
        return res;
      };
      this.pending.push(innerTask);
      if (!this.active) {
        this.fireNextTask();
      }
    }) as Promise<T>;
  }
}

export default Scheduler;
