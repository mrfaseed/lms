import type { IncomingMessage, OutgoingMessage } from './executor.worker';

type ExecutionCallbacks = {
  onOutput: (msg: string) => void;
  onError: (msg: string) => void;
  onExit: (code: number) => void;
  onInputRequest: () => void;
};

export class ExecutionManager {
  private worker: Worker | null = null;
  private sharedBuffer: SharedArrayBuffer | null = null;
  private int32Array: Int32Array | null = null;
  
  constructor() {
    // SharedArrayBuffer size: 4 bytes (status) + 4 bytes (length) + 1024 bytes (string data) = 1032 bytes
    if (typeof SharedArrayBuffer !== 'undefined') {
      this.sharedBuffer = new SharedArrayBuffer(1032);
      this.int32Array = new Int32Array(this.sharedBuffer);
    } else {
      console.error("SharedArrayBuffer is not available. Please ensure COOP/COEP headers are set.");
    }
  }

  public run(lang: string, code: string, callbacks: ExecutionCallbacks) {
    console.log("ExecutionManager.run called with lang:", lang);
    if (!this.sharedBuffer || !this.int32Array) {
      callbacks.onError("Execution Engine Error: SharedArrayBuffer is not supported in this environment.\nCheck server headers (COOP/COEP).");
      callbacks.onExit(1);
      return;
    }

    this.stop(); // Ensure any previous worker is terminated

    try {
      console.log("Instantiating Web Worker...");
      // Use Next.js URL import for the web worker as a classic worker
      this.worker = new Worker(new URL('./executor.worker.ts', import.meta.url));
      console.log("Worker instantiated successfully:", this.worker);
      
      this.worker.onerror = (e) => {
        console.error("Worker fatal error:", e);
        callbacks.onError("Worker encountered a fatal error: " + (e.message || String(e)));
        callbacks.onExit(1);
      };
    } catch (e) {
      console.error("Failed to instantiate Web Worker:", e);
      callbacks.onError("Failed to spawn Web Worker: " + String(e));
      callbacks.onExit(1);
      return;
    }

    this.worker.onmessage = (e: MessageEvent<OutgoingMessage>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'STDOUT':
          callbacks.onOutput(msg.payload);
          break;
        case 'STDERR':
          callbacks.onError(msg.payload);
          break;
        case 'INPUT_REQUEST':
          callbacks.onInputRequest();
          break;
        case 'EXIT':
          callbacks.onExit(msg.code);
          break;
      }
    };

    // Send the RUN command with the shared buffer
    const runMsg: IncomingMessage = {
      type: 'RUN',
      lang,
      code,
      sharedBuffer: this.sharedBuffer
    };
    this.worker.postMessage(runMsg);
  }

  public provideInput(text: string) {
    if (!this.sharedBuffer || !this.int32Array || !this.worker) return;

    // Encode string to bytes
    const encoder = new TextEncoder();
    const encodedText = encoder.encode(text);
    
    // Safety check: ensure string fits in buffer (max 1024 bytes)
    const len = Math.min(encodedText.length, 1024);

    // Write length to index 1 (bytes 4-7)
    Atomics.store(this.int32Array, 1, len);

    // Write string data starting at byte offset 8
    const dataView = new Uint8Array(this.sharedBuffer, 8);
    dataView.set(encodedText.slice(0, len));

    // Update status to 1 (ready) and notify the sleeping worker
    Atomics.store(this.int32Array, 0, 1);
    Atomics.notify(this.int32Array, 0, 1);
  }

  public stop() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
