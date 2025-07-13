export interface WorkerTask<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  transferable?: Transferable[];
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface WorkerResult<R = any> {
  id: string;
  success: boolean;
  data?: R;
  error?: string;
  executionTime: number;
}

export interface WorkerPoolConfig {
  maxWorkers: number;
  maxQueueSize: number;
  workerScript: string;
  terminateTimeout: number;
}

interface QueuedTask {
  task: WorkerTask;
  resolve: (result: WorkerResult) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  taskId?: string;
  startTime?: number;
}

export class WorkerManager {
  private workers: WorkerInstance[] = [];
  private taskQueue: QueuedTask[] = [];
  private pendingTasks = new Map<string, QueuedTask>();
  private config: WorkerPoolConfig;
  private isInitialized = false;

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    this.config = {
      maxWorkers: navigator.hardwareConcurrency || 4,
      maxQueueSize: 100,
      terminateTimeout: 5000,
      workerScript: '',
      ...config
    };
  }

  public async initialize(workerScript: string): Promise<void> {
    if (this.isInitialized) return;

    this.config.workerScript = workerScript;
    
    // Create initial worker pool
    const initialWorkers = Math.min(2, this.config.maxWorkers);
    for (let i = 0; i < initialWorkers; i++) {
      await this.createWorker();
    }

    this.isInitialized = true;
  }

  public async execute<T, R>(task: WorkerTask<T, R>): Promise<WorkerResult<R>> {
    if (!this.isInitialized) {
      throw new Error('WorkerManager not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = {
        task,
        resolve: resolve as (result: WorkerResult) => void,
        reject,
        timestamp: Date.now()
      };

      // Check queue size limit
      if (this.taskQueue.length >= this.config.maxQueueSize) {
        reject(new Error('Worker queue is full'));
        return;
      }

      this.taskQueue.push(queuedTask);
      this.processQueue();
    });
  }

  public async executeParallel<T, R>(tasks: WorkerTask<T, R>[]): Promise<WorkerResult<R>[]> {
    const promises = tasks.map(task => this.execute(task));
    return Promise.all(promises);
  }

  public getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      queueLength: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size
    };
  }

  public async terminate(): Promise<void> {
    // Cancel all pending tasks
    for (const [taskId, queuedTask] of this.pendingTasks) {
      queuedTask.reject(new Error('WorkerManager terminated'));
    }
    this.pendingTasks.clear();
    this.taskQueue = [];

    // Terminate all workers
    const terminatePromises = this.workers.map(instance => 
      this.terminateWorker(instance)
    );
    
    await Promise.all(terminatePromises);
    this.workers = [];
    this.isInitialized = false;
  }

  private async createWorker(): Promise<WorkerInstance> {
    const worker = new Worker(this.config.workerScript); // Use classic worker (default)
    
    const instance: WorkerInstance = {
      worker,
      busy: false
    };

    worker.onmessage = (event) => {
      this.handleWorkerMessage(instance, event);
    };

    worker.onerror = (error) => {
      this.handleWorkerError(instance, error);
    };

    this.workers.push(instance);
    return instance;
  }

  private async terminateWorker(instance: WorkerInstance): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        instance.worker.terminate();
        resolve();
      }, this.config.terminateTimeout);

      instance.worker.onmessage = null;
      instance.worker.onerror = null;
      
      // Try graceful termination first
      instance.worker.postMessage({ type: 'terminate' });
      
      // Wait for worker to acknowledge termination
      const originalOnMessage = instance.worker.onmessage;
      instance.worker.onmessage = (event) => {
        if (event.data.type === 'terminated') {
          clearTimeout(timeout);
          instance.worker.terminate();
          resolve();
        } else if (originalOnMessage) {
          originalOnMessage(event);
        }
      };
    });
  }

  private processQueue(): void {
    if (this.taskQueue.length === 0) return;

    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.task.priority || 'normal'];
      const bPriority = priorityOrder[b.task.priority || 'normal'];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return a.timestamp - b.timestamp; // FIFO for same priority
    });

    // Find available worker or create new one
    let availableWorker = this.workers.find(w => !w.busy);
    
    if (!availableWorker && this.workers.length < this.config.maxWorkers) {
      // Create new worker if under limit
      this.createWorker().then(worker => {
        this.assignTaskToWorker(worker);
      });
      return;
    }

    if (availableWorker) {
      this.assignTaskToWorker(availableWorker);
    }
  }

  private assignTaskToWorker(worker: WorkerInstance): void {
    const queuedTask = this.taskQueue.shift();
    if (!queuedTask) return;

    worker.busy = true;
    worker.taskId = queuedTask.task.id;
    worker.startTime = Date.now();

    this.pendingTasks.set(queuedTask.task.id, queuedTask);

    // Set up timeout if specified
    if (queuedTask.task.timeout) {
      setTimeout(() => {
        if (this.pendingTasks.has(queuedTask.task.id)) {
          this.handleTaskTimeout(worker, queuedTask);
        }
      }, queuedTask.task.timeout);
    }

    // Send task to worker
    try {
      worker.worker.postMessage(
        {
          type: 'task',
          task: queuedTask.task
        },
        queuedTask.task.transferable || []
      );
    } catch (error) {
      this.handleWorkerError(worker, error);
    }
  }

  private handleWorkerMessage(worker: WorkerInstance, event: MessageEvent): void {
    const { type, taskId, result, error } = event.data;

    if (type === 'task-complete' && taskId) {
      const queuedTask = this.pendingTasks.get(taskId);
      if (!queuedTask) return;

      this.pendingTasks.delete(taskId);
      
      const executionTime = worker.startTime ? Date.now() - worker.startTime : 0;
      
      const workerResult: WorkerResult = {
        id: taskId,
        success: !error,
        data: result,
        error,
        executionTime
      };

      if (error) {
        queuedTask.reject(new Error(error));
      } else {
        queuedTask.resolve(workerResult);
      }

      // Mark worker as available and process next task
      worker.busy = false;
      worker.taskId = undefined;
      worker.startTime = undefined;
      
      this.processQueue();
    }
  }

  private handleWorkerError(worker: WorkerInstance, error: any): void {
    console.error('Worker error:', error);
    
    // Handle any pending task for this worker
    if (worker.taskId) {
      const queuedTask = this.pendingTasks.get(worker.taskId);
      if (queuedTask) {
        this.pendingTasks.delete(worker.taskId);
        queuedTask.reject(new Error(`Worker error: ${error.message || error}`));
      }
    }

    // Remove the failed worker and create a replacement
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
      worker.worker.terminate();
      
      // Create replacement worker if we're below minimum
      if (this.workers.length < 2 && this.isInitialized) {
        this.createWorker();
      }
    }
  }

  private handleTaskTimeout(worker: WorkerInstance, queuedTask: QueuedTask): void {
    this.pendingTasks.delete(queuedTask.task.id);
    queuedTask.reject(new Error(`Task timeout: ${queuedTask.task.id}`));
    
    // Terminate and replace the worker
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex !== -1) {
      this.workers.splice(workerIndex, 1);
      worker.worker.terminate();
      
      // Create replacement
      this.createWorker();
    }
  }
}