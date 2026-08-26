declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
    ts: any;
    initSqlJs: any;
    __idePromptHandler?: (msg?: string) => string;
    __idePromptWrapped?: boolean;
    __nativePrompt?: (msg?: string) => string;
    _ideStdout?: (msg: string) => void;
  }
}

if (typeof window !== 'undefined' && window.prompt && !window.__idePromptWrapped) {
  // Bind to window to prevent "does not implement interface Window" errors on strict host objects
  const realPrompt = window.prompt.bind(window);
  window.prompt = function(msg?: string) {
    if (window.__idePromptHandler) {
      return window.__idePromptHandler(msg);
    }
    return realPrompt(msg || '') || '';
  };
  window.__nativePrompt = function(msg?: string) {
    return realPrompt(msg || '') || '';
  };
  window.__idePromptWrapped = true;
}

export const executeJavaScript = async (code: string) => {
  let output = '';
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.log = (...args) => {
    output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n';
  };
  console.error = (...args) => {
    output += 'Error: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n';
  };
  console.warn = (...args) => {
    output += 'Warning: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n';
  };

  try {
    const fn = new Function(code);
    fn();
    return { stdout: output, stderr: '', exit_code: 0 };
  } catch (error: any) {
    return { stdout: output, stderr: error.toString(), exit_code: 1 };
  } finally {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
};

// Helper to safely load UMD scripts without breaking Monaco's AMD loader
const loadScript = (src: string, globalName: string) => {
  if ((window as any)[globalName]) return Promise.resolve((window as any)[globalName]);
  
  if (document.querySelector(`script[src*="${src.split('/').pop()}"]`)) {
    return new Promise(async (resolve) => {
      while(!(window as any)[globalName]) await new Promise(r => setTimeout(r, 100));
      resolve((window as any)[globalName]);
    });
  }

  return new Promise((resolve, reject) => {
    // Temporarily hide define.amd to force global assignment instead of AMD registration
    let defineAmd = null;
    if (typeof window !== 'undefined' && (window as any).define && (window as any).define.amd) {
      defineAmd = (window as any).define.amd;
      delete (window as any).define.amd;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      if (defineAmd) {
        (window as any).define.amd = defineAmd;
      }
      resolve((window as any)[globalName]);
    };
    script.onerror = (err) => {
      if (defineAmd) {
        (window as any).define.amd = defineAmd;
      }
      reject(err);
    };
    document.head.appendChild(script);
  });
};

export const loadPyodideEngine = async () => {
  return await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js', 'loadPyodide').then(async (loadPyodide: any) => {
    if (!window.pyodide) {
      window.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
      });
    }
    return window.pyodide;
  });
};

export const executePython = async (code: string, stdin: string) => {
  let output = '';
  
  try {
    const pyodide = await loadPyodideEngine();
    
    // We override stdout internally via python so it's strictly unbatched!
    window._ideStdout = (msg: string) => {
      output += msg;
    };
    
    await pyodide.runPythonAsync(`
import sys
import js

class IDEStream:
    def write(self, text):
        js.window._ideStdout(text)
    def flush(self):
        pass

sys.stdout = IDEStream()
sys.stderr = IDEStream()
`);

    let stdinLines = stdin ? stdin.split('\n') : [];
    let stdinIndex = 0;
    
    // Use the global prompt handler we set up at the top of the file
    window.__idePromptHandler = (msg?: string) => {
      let val = "";
      if (stdinIndex < stdinLines.length) {
        val = stdinLines[stdinIndex++];
      } else {
        // Fallback to interactive prompt if input tab is empty/exhausted
        val = window.__nativePrompt ? window.__nativePrompt(msg || '') || '' : '';
      }
      // Echo the typed input back into the terminal so it behaves like a real terminal!
      output += val + '\n';
      return val;
    };

    // Run the python code
    await pyodide.runPythonAsync(code);
    return { stdout: output, stderr: '', exit_code: 0 };
  } catch (error: any) {
    return { stdout: output, stderr: error.toString(), exit_code: 1 };
  } finally {
    window.__idePromptHandler = undefined;
  }
};

export const loadTypeScript = async () => {
  return await loadScript('https://cdnjs.cloudflare.com/ajax/libs/typescript/5.3.3/typescript.min.js', 'ts');
};

export const executeTypeScript = async (code: string) => {
  try {
    const ts = await loadTypeScript();
    const jsCode = ts.transpile(code);
    return await executeJavaScript(jsCode);
  } catch (error: any) {
    return { stdout: '', stderr: error.toString(), exit_code: 1 };
  }
};

export const loadSqlJs = async () => {
  return await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js', 'initSqlJs');
};

export const executeSQL = async (code: string) => {
  let output = '';
  try {
    const initSqlJs = await loadSqlJs();
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });
    
    const db = new SQL.Database();
    const res = db.exec(code);
    
    if (res.length === 0) {
      output = "Command executed successfully.";
    } else {
      res.forEach((r: any) => {
        output += r.columns.join(' | ') + '\n';
        output += '-'.repeat(Math.min(r.columns.join(' | ').length, 50)) + '\n';
        r.values.forEach((row: any[]) => {
          output += row.join(' | ') + '\n';
        });
        output += '\n';
      });
    }
    
    return { stdout: output, stderr: '', exit_code: 0 };
  } catch (error: any) {
    return { stdout: output, stderr: error.toString(), exit_code: 1 };
  }
};

export const executeCppMock = async (code: string) => {
  await new Promise(r => setTimeout(r, 800));
  
  // Extract simple print statements to make the mock feel alive
  const prints = [...code.matchAll(/printf\("([^"]+)"[^\)]*\)/g)].map(m => m[1]);
  const couts = [...code.matchAll(/std::cout\s*<<\s*"([^"]+)"/g)].map(m => m[1]);
  
  let outputs = [...prints, ...couts].join('\n');
  if (!outputs.trim()) outputs = "Program executed successfully.";
  
  return { stdout: outputs.replace(/\\n/g, '\n').trim(), stderr: '', exit_code: 0 };
};

export const executeJavaMock = async (code: string) => {
  await new Promise(r => setTimeout(r, 1200));
  
  const prints = [...code.matchAll(/System\.out\.print(?:ln)?\("([^"]+)"\)/g)].map(m => m[1]);
  
  let outputs = prints.join('\n');
  if (!outputs.trim()) outputs = "Program executed successfully.";
  
  return { stdout: outputs.replace(/\\n/g, '\n').trim(), stderr: '', exit_code: 0 };
};
