// Web Worker for Universal Execution Engine
console.log("Worker Script Loaded: executor.worker.ts");

// Types for messages
export type IncomingMessage = 
  | { type: 'RUN'; lang: string; code: string; sharedBuffer: SharedArrayBuffer }
  | { type: 'STOP' };

export type OutgoingMessage = 
  | { type: 'STDOUT'; payload: string }
  | { type: 'STDERR'; payload: string }
  | { type: 'INPUT_REQUEST' }
  | { type: 'EXIT'; code: number };

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
    __ideStdout?: (msg: string) => void;
  }
}

let pyodideInstance: any = null;
let currentInt32Array: Int32Array | null = null;
let currentUint8Array: Uint8Array | null = null;

const postMsg = (msg: OutgoingMessage) => {
  postMessage(msg);
};

const loadPyodideEngine = async () => {
  if (pyodideInstance) return pyodideInstance;
  
  // We must importScripts for pyodide in a worker
  (self as any).importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  
  pyodideInstance = await (self as any).loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
  });
  return pyodideInstance;
};

const executePython = async (code: string, sharedBuffer: SharedArrayBuffer) => {
  try {
    const pyodide = await loadPyodideEngine();
    
    // Setup shared memory for synchronous input blocking
    currentInt32Array = new Int32Array(sharedBuffer);
    currentUint8Array = new Uint8Array(sharedBuffer, 4); // String data starts at offset 4

    // Override stdout/stderr to send messages
    (self as any)._ideStdout = (msg: string) => {
      postMsg({ type: 'STDOUT', payload: msg });
    };

    // Override standard input to use Atomics.wait
    (self as any)._idePromptHandler = () => {
      // 1. Tell the main thread we need input
      postMsg({ type: 'INPUT_REQUEST' });
      
      // 2. Sleep the worker until main thread wakes us up!
      // Index 0 represents the status: 0 = sleeping, 1 = ready
      Atomics.store(currentInt32Array!, 0, 0); 
      Atomics.wait(currentInt32Array!, 0, 0); // Blocks here!
      
      // 3. We are awake! Read the string length from Index 1
      const length = Atomics.load(currentInt32Array!, 1);
      
      // 4. Read the string data
      const textDecoder = new TextDecoder();
      const stringData = new Uint8Array(sharedBuffer, 8, length); // Data starts at offset 8
      
      // TextDecoder cannot decode directly from a SharedArrayBuffer view.
      // We must copy the bytes into a standard ArrayBuffer first.
      const normalArray = new Uint8Array(stringData);
      const val = textDecoder.decode(normalArray);
      
      // Echo the typed input
      postMsg({ type: 'STDOUT', payload: val + '\n' });
      return val;
    };

    // Inject python overrides
    await pyodide.runPythonAsync(`
import sys
import js

class IDEStream:
    def write(self, text):
        js._ideStdout(text)
    def flush(self):
        pass

sys.stdout = IDEStream()
sys.stderr = IDEStream()

# Override input function to call our blocking JS handler
import builtins
def custom_input(prompt=""):
    sys.stdout.write(prompt)
    sys.stdout.flush()
    return js._idePromptHandler()

builtins.input = custom_input
`);

    // Run the user's code
    await pyodide.runPythonAsync(code);
    postMsg({ type: 'EXIT', code: 0 });

  } catch (error: any) {
    postMsg({ type: 'STDERR', payload: error.toString() });
    postMsg({ type: 'EXIT', code: 1 });
  } finally {
    currentInt32Array = null;
    currentUint8Array = null;
  }
};

const executeJavaScript = async (code: string) => {
  // Mock simple JS execution
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (...args) => {
    postMsg({ type: 'STDOUT', payload: args.map(String).join(' ') + '\n' });
  };
  console.error = (...args) => {
    postMsg({ type: 'STDERR', payload: 'Error: ' + args.map(String).join(' ') + '\n' });
  };

  try {
    const fn = new Function(code);
    fn();
    postMsg({ type: 'EXIT', code: 0 });
  } catch (error: any) {
    postMsg({ type: 'STDERR', payload: error.toString() });
    postMsg({ type: 'EXIT', code: 1 });
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
};

self.onmessage = async (e: MessageEvent<IncomingMessage>) => {
  const msg = e.data;
  
  if (msg.type === 'RUN') {
    if (msg.lang === 'python') {
      await executePython(msg.code, msg.sharedBuffer);
    } else if (msg.lang === 'javascript') {
      await executeJavaScript(msg.code);
    } else {
      postMsg({ type: 'STDERR', payload: `Language ${msg.lang} is not yet supported in worker.` });
      postMsg({ type: 'EXIT', code: 1 });
    }
  }
};
