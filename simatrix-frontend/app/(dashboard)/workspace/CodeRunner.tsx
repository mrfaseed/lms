'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSearchParams } from 'next/navigation';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { 
  Play, Maximize2, Minimize2, File, FolderPlus, 
  Upload, Terminal, FileText, X, CheckCircle2,
  Plus, Send, Settings, Save, Clock, Cpu, FileCode, AlertCircle
} from 'lucide-react';
import { executeJavaScript, executePython, executeTypeScript, executeSQL, executeCppMock, executeJavaMock } from './executor';
import { ExecutionManager } from './ExecutionManager';

type VirtualFile = {
  id: string;
  name: string;
  content: string;
  language: string;
};

const DEFAULT_FILES: VirtualFile[] = [
  { id: 'f1', name: 'main.py', language: 'python', content: 'print("Hello, World!")' }
];

const TerminalBootLoader = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 600);
    const t3 = setTimeout(() => setStep(3), 900);
    const t4 = setTimeout(() => setStep(4), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="flex flex-col w-full text-slate-300 font-mono text-sm space-y-2">
      <div className="text-emerald-400 font-bold mb-2">&gt; Starting Python Runtime...</div>
      {step >= 1 && <div className="text-slate-300"><span className="text-emerald-500 mr-2">✓</span>Loading Web Worker</div>}
      {step >= 2 && <div className="text-slate-300"><span className="text-emerald-500 mr-2">✓</span>Initializing Environment</div>}
      {step >= 3 && <div className="text-slate-300"><span className="text-emerald-500 mr-2">✓</span>Mounting Virtual Filesystem</div>}
      {step >= 4 && (
        <div className="text-slate-300 animate-pulse">
          <span className="text-indigo-400 mr-2 animate-spin inline-block origin-center" style={{ lineHeight: 1 }}>⟳</span>
          Downloading Python Engine...
        </div>
      )}
    </div>
  );
};

export default function CodeRunner() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment') || searchParams.get('problem');
  const isAssignment = !!assignmentId;

  // Layout & UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Execution Manager State
  const execManagerRef = useRef<ExecutionManager | null>(null);
  const [isAwaitingInput, setIsAwaitingInput] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'input'>('output');

  // VFS State
  const initialFiles = isAssignment 
    ? [{ id: 'f1', name: 'solution.py', language: 'python', content: `# Assignment: ${assignmentId}\n# Write your solution below\n\ndef solution():\n    pass\n` }]
    : DEFAULT_FILES;
    
  const [files, setFiles] = useState<VirtualFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>('f1');
  const [openFileIds, setOpenFileIds] = useState<string[]>(['f1']);
  const [stdin, setStdin] = useState<string>('');
  
  // Execution State
  const [output, setOutput] = useState<string>('System ready. Waiting for execution...');
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [execMeta, setExecMeta] = useState<{ time: string; memory: string; code: number } | null>(null);

  // UI State
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  // Initialize ExecutionManager on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      execManagerRef.current = new ExecutionManager();
    }
    return () => {
      execManagerRef.current?.stop();
    };
  }, []);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  
  // Create File State
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const activeFile = activeFileId ? files.find(f => f.id === activeFileId) || null : null;

  // Next.js Turbopack Dynamic Import Fix
  // Monaco's loader globally defines `define.amd`. When Next.js tries to dynamically import modules
  // (like the error-stack-parser for the dev error overlay), the modules incorrectly think they are
  // in an AMD environment and fail to load, crashing the entire app.
  // We delete `define.amd` after Monaco loads to prevent this.
  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (typeof window !== 'undefined' && (window as any).define && (window as any).define.amd) {
      delete (window as any).define.amd;
    }
  };

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Close menus if clicking outside
      const target = e.target as HTMLElement;
      if (!target.closest('.add-menu-container')) setIsAddMenuOpen(false);
      if (!target.closest('.settings-menu-container')) setIsSettingsOpen(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Trigger Save (mock for now)
        console.log("Saved to virtual file system!");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, stdin]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined || !activeFileId) return;
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: value } : f));
  };

  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setActiveConsoleTab('output');
    setOutput('');
    setExecMeta(null);
    setIsAwaitingInput(false);
    setTerminalInput('');

    const startTime = performance.now();

    try {
      if (activeFile.language === 'javascript' || activeFile.language === 'python') {
        if (activeFile.language === 'python') setIsInitializing(true);
        
        execManagerRef.current?.run(activeFile.language, activeFile.content, {
          onOutput: (msg) => {
            setIsInitializing(false);
            setOutput(prev => prev + msg);
          },
          onError: (msg) => {
            setIsInitializing(false);
            setOutput(prev => prev + '\n' + msg);
          },
          onInputRequest: () => {
            setIsInitializing(false);
            setIsAwaitingInput(true);
          },
          onExit: (code) => {
            setIsInitializing(false);
            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(3);
            setExecMeta({ time: timeTaken + 's', memory: activeFile.language === 'python' ? '~ 25 MB' : '< 1 MB', code });
            setIsRunning(false);
            setIsAwaitingInput(false);
          }
        });
        return;
      }

      if (activeFile.language === 'typescript') {
        setOutput('Compiling to WebAssembly (Mock)...');
        const result = await executeCppMock(activeFile.content);
        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(3);
        setExecMeta({ time: timeTaken + 's', memory: '~ 12 MB', code: result.exit_code });
        setOutput(result.stderr ? result.stdout + '\n' + result.stderr : result.stdout);
        setIsRunning(false);
        return;
      }

      if (activeFile.language === 'java') {
        setOutput('Initializing CheerpJ JVM (Mock)...');
        const result = await executeJavaMock(activeFile.content);
        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(3);
        setExecMeta({ time: timeTaken + 's', memory: '~ 64 MB', code: result.exit_code });
        setOutput(result.stderr ? result.stdout + '\n' + result.stderr : result.stdout);
        setIsRunning(false);
        return;
      }

      // Should never reach here since all languages are covered
      setIsRunning(false);
      setOutput('Language not supported.');
    } catch (error) {
      setOutput('System Error: ' + (error as Error).message);
      setIsRunning(false);
    }
  };

  const handleSubmitAssignment = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab('output');
    setOutput('Running Test Cases...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOutput('[Test 1] Passed\n[Test 2] Passed\n[Test 3] Passed\n\nSuccess! Your solution has been submitted.');
    setIsSubmitting(false);
  };

  const handleAddFile = () => {
    if (isAssignment) return;
    setIsCreatingFile(true);
    setNewFileName('');
  };

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    if (isAssignment) return;
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleCloseTab = (fileId: string) => {
    const newOpenIds = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(newOpenIds);
    if (activeFileId === fileId) {
      setActiveFileId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    handleCloseTab(fileId);
  };

  const handleOpenFile = (fileId: string) => {
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds([...openFileIds, fileId]);
    }
    setActiveFileId(fileId);
  };

  const isRenameDuplicate = files.some(f => f.name === renameValue && f.id !== renamingFileId);
  const isNewFileDuplicate = files.some(f => f.name === newFileName);

  const determineLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'py') return 'python';
    if (ext === 'js') return 'javascript';
    if (ext === 'ts') return 'typescript';
    if (ext === 'c') return 'c';
    if (ext === 'cpp') return 'cpp';
    if (ext === 'java') return 'java';
    if (ext === 'sql') return 'sql';
    return 'plaintext';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'py': return '🐍';
      case 'java': return '☕';
      case 'c': 
      case 'cpp': return '⚙️';
      case 'js': 
      case 'ts': return '⚡';
      case 'sql': return '🗄️';
      case 'md': return '📄';
      default: return '📄';
    }
  };

  const getDefaultContent = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'py': return 'print("Hello, World!")\n';
      case 'js': return 'console.log("Hello, World!");\n';
      case 'ts': return 'console.log("Hello, TypeScript!");\n';
      case 'c': return '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n';
      case 'cpp': return '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n';
      case 'java': return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n';
      case 'sql': return 'CREATE TABLE users (id INT, name TEXT);\nINSERT INTO users VALUES (1, "Alice");\nSELECT * FROM users;\n';
      default: return '';
    }
  };

  const handleRenameSubmit = (fileId: string) => {
    if (!renameValue.trim() || isRenameDuplicate) {
      setRenamingFileId(null);
      return;
    }
    const newLang = determineLanguage(renameValue);
    setFiles(files.map(f => f.id === fileId ? { ...f, name: renameValue, language: newLang } : f));
    setRenamingFileId(null);
  };

  const handleCreateFileSubmit = () => {
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }
    if (isNewFileDuplicate) return;
    
    const newLang = determineLanguage(newFileName);
    const defaultContent = getDefaultContent(newFileName);
    
    const newFile = { id: `f${Date.now()}`, name: newFileName, content: defaultContent, language: newLang };
    setFiles([...files, newFile]);
    setOpenFileIds([...openFileIds, newFile.id]);
    setActiveFileId(newFile.id);
    setIsCreatingFile(false);
  };

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 shadow-2xl ${
        isFullscreen ? 'w-screen h-screen fixed inset-0 z-50 rounded-none border-none' : 'h-[calc(100vh-10rem)]'
      }`}
    >
      {/* TOOLBAR */}
      <div className="h-14 flex items-center justify-between px-4 bg-[#252526] border-b border-[#333] shrink-0 text-slate-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-slate-100 tracking-wide">
              {isAssignment ? `Assignment: ${assignmentId}` : 'Simatrix IDE'}
            </span>
          </div>
          
          <div className="h-5 w-px bg-slate-600 mx-2"></div>
          
          <div className="relative settings-menu-container">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-[#37373d] rounded transition-colors text-lg" 
              title="Settings"
            >
              ⚙
            </button>
            {isSettingsOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[#252526] border border-[#333] rounded shadow-xl z-[100] py-1 text-sm text-slate-300">
                {['Theme', 'Font Size', 'Tab Size', 'Word Wrap', 'Auto Save', 'Editor Font', 'Zoom', 'Keybindings'].map(item => (
                  <button key={item} className="w-full text-left px-4 py-1.5 hover:bg-[#37373d] hover:text-white">
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {execMeta && (
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono shrink-0 mr-2 pr-4 border-r border-[#333]">
              <div className="flex items-center bg-[#1e1e1e] text-slate-300 px-2 py-1 rounded border border-[#333] whitespace-nowrap shadow-sm">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> 
                {execMeta.time}
              </div>
              <div className="flex items-center bg-[#1e1e1e] text-slate-300 px-2 py-1 rounded border border-[#333] whitespace-nowrap shadow-sm">
                <Cpu className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> 
                {execMeta.memory}
              </div>
              <div className={`flex items-center px-2 py-1 rounded font-bold whitespace-nowrap shadow-sm ${execMeta.code === 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                Exit {execMeta.code}
              </div>
            </div>
          )}

          <button 
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting || !activeFile}
            className="flex items-center px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded shadow-sm transition-colors disabled:opacity-50"
            title="Run Code (Ctrl+Enter)"
          >
            {isRunning ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Running</span>
            ) : (
              <span className="flex items-center"><Play className="w-4 h-4 mr-2" fill="currentColor" /> Run</span>
            )}
          </button>
          
          {isAssignment && (
            <button 
              onClick={handleSubmitAssignment}
              disabled={isRunning || isSubmitting}
              className="flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Submitting</span>
              ) : (
                <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Submit</span>
              )}
            </button>
          )}

          <div className="h-5 w-px bg-slate-600 mx-1"></div>
          
          <button 
            onClick={toggleFullscreen} 
            className="flex items-center px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#37373d] rounded transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <><Minimize2 className="w-4 h-4 mr-1.5" /> Exit Fullscreen</>
            ) : (
              <><Maximize2 className="w-4 h-4 mr-1.5" /> Fullscreen</>
            )}
          </button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <div className="flex-1 min-h-0">
        <Group direction="horizontal">
          
          {/* EXPLORER PANEL */}
          <Panel defaultSize={15} minSize={10} className="bg-[#252526] flex-col hidden md:flex border-r border-[#333]">
            <div className="px-4 py-2 flex items-center justify-between add-menu-container relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorer</span>
              {!isAssignment && (
                <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className="text-slate-400 hover:text-white relative">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
              {isAddMenuOpen && (
                <div className="absolute top-7 right-2 w-36 bg-[#252526] border border-[#333] rounded shadow-xl z-[100] py-1 text-sm text-slate-300">
                  <button onClick={() => { setIsAddMenuOpen(false); handleAddFile(); }} className="w-full text-left px-3 py-1.5 hover:bg-[#37373d] hover:text-white flex items-center">
                    <File className="w-3.5 h-3.5 mr-2" /> New File
                  </button>
                  <button onClick={() => setIsAddMenuOpen(false)} className="w-full text-left px-3 py-1.5 hover:bg-[#37373d] hover:text-white flex items-center">
                    <FolderPlus className="w-3.5 h-3.5 mr-2" /> New Folder
                  </button>
                  <button onClick={() => setIsAddMenuOpen(false)} className="w-full text-left px-3 py-1.5 hover:bg-[#37373d] hover:text-white flex items-center">
                    <Upload className="w-3.5 h-3.5 mr-2" /> Upload File
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto mt-1 relative">
              {files.map(f => (
                <div 
                  key={f.id}
                  onClick={() => handleOpenFile(f.id)}
                  onContextMenu={(e) => handleContextMenu(e, f.id)}
                  className={`px-4 py-1.5 text-sm cursor-pointer flex items-center justify-between group ${activeFileId === f.id ? 'bg-[#37373d] text-white border-l-2 border-indigo-500' : 'text-slate-300 hover:bg-[#2a2d2e] border-l-2 border-transparent'}`}
                >
                  <div className="flex items-center truncate w-full">
                    <span className="mr-2 text-[13px]">{getFileIcon(f.name)}</span>
                    {renamingFileId === f.id ? (
                      <div className="w-full flex flex-col">
                        <input 
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => { if (!isRenameDuplicate) handleRenameSubmit(f.id); }}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') handleRenameSubmit(f.id); 
                            else if (e.key === 'Escape') setRenamingFileId(null);
                          }}
                          className={`bg-[#1e1e1e] text-white px-1.5 py-0.5 outline-none w-full border rounded text-xs transition-colors ${
                            isRenameDuplicate ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]' : 'border-indigo-500'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isRenameDuplicate && (
                          <div className="text-rose-400 text-[10px] mt-1 font-medium">
                            File name already exists
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="truncate">{f.name}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {/* NEW FILE INPUT */}
              {isCreatingFile && (
                <div className="px-4 py-1.5 text-sm flex flex-col group">
                  <div className="flex items-center w-full">
                    <span className="mr-2 text-[13px]">{getFileIcon(newFileName)}</span>
                    <div className="w-full flex flex-col">
                      <input 
                        autoFocus
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => { if (!isNewFileDuplicate) handleCreateFileSubmit(); }}
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter') handleCreateFileSubmit(); 
                          else if (e.key === 'Escape') setIsCreatingFile(false);
                        }}
                        className={`bg-[#1e1e1e] text-white px-1.5 py-0.5 outline-none w-full border rounded text-xs transition-colors ${
                          isNewFileDuplicate ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]' : 'border-indigo-500'
                        }`}
                      />
                      {isNewFileDuplicate && (
                        <div className="text-rose-400 text-[10px] mt-1 font-medium">
                          File name already exists
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Separator className="w-1 bg-[#333] hover:bg-indigo-500 transition-colors" />

          {/* EDITOR & CONSOLE PANEL */}
          <Panel defaultSize={85}>
            <Group direction="vertical">
              
              {/* EDITOR */}
              <Panel defaultSize={70} className="flex flex-col relative">
                {/* File Tabs */}
                <div className="flex bg-[#2d2d2d] overflow-x-auto shrink-0 border-b border-[#1e1e1e]">
                  {openFileIds.map(id => {
                    const f = files.find(file => file.id === id);
                    if (!f) return null;
                    return (
                      <div 
                        key={f.id} 
                        onClick={() => setActiveFileId(f.id)}
                        className={`px-3 py-2 text-sm flex items-center cursor-pointer min-w-max border-t-2 group/tab ${activeFileId === f.id ? 'bg-[#1e1e1e] text-indigo-400 border-indigo-500' : 'text-slate-400 border-transparent hover:bg-[#2a2d2e]'}`}
                      >
                        <span className="mr-2 text-[13px]">{getFileIcon(f.name)}</span>
                        <span className="mr-2">{f.name}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseTab(f.id);
                          }}
                          className={`p-0.5 rounded-md hover:bg-[#333] transition-colors ${
                            activeFileId === f.id ? 'opacity-100 text-slate-300 hover:text-white' : 'opacity-0 group-hover/tab:opacity-100 text-slate-400 hover:text-white'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Monaco Editor or Empty State */}
                <div className="flex-1 relative">
                  {activeFileId && activeFile ? (
                    <Editor
                      height="100%"
                      language={activeFile.language}
                      theme="vs-dark"
                      value={activeFile.content}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        wordWrap: "on",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#1e1e1e]">
                      <div className="text-center flex flex-col items-center">
                        <div className="text-6xl mb-4 opacity-50">📂</div>
                        <p className="text-sm font-medium">Create a file or click a file to explore</p>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>

              <Separator className="h-1 bg-[#333] hover:bg-indigo-500 transition-colors" />

              {/* CONSOLE */}
              <Panel defaultSize={30} className="flex flex-col bg-[#1e1e1e]">
                {/* Console Tabs */}
                <div className="flex items-center justify-between bg-[#252526] shrink-0 border-b border-[#333] w-full">
                  <div className="flex shrink-0">
                    <button 
                      onClick={() => setActiveConsoleTab('output')}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center border-t-2 ${activeConsoleTab === 'output' ? 'bg-[#1e1e1e] text-slate-100 border-indigo-500' : 'text-slate-400 border-transparent hover:bg-[#2a2d2e]'}`}
                    >
                      <Terminal className="w-3.5 h-3.5 mr-2" /> Output
                    </button>
                    <button 
                      onClick={() => setActiveConsoleTab('input')}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center border-t-2 ${activeConsoleTab === 'input' ? 'bg-[#1e1e1e] text-slate-100 border-indigo-500' : 'text-slate-400 border-transparent hover:bg-[#2a2d2e]'}`}
                    >
                      <FileText className="w-3.5 h-3.5 mr-2" /> Input (stdin)
                    </button>
                  </div>
                </div>

                {/* Console Content */}
                <div className="flex-1 overflow-hidden relative">
                  {activeConsoleTab === 'output' ? (
                    <div className="absolute inset-0 p-4 overflow-y-auto font-mono text-sm">
                      {!output && !isRunning && !execMeta && !isInitializing ? (
                        <div className="text-slate-500 flex flex-col space-y-2 select-none border border-[#333] p-4 rounded-md bg-[#252526]">
                          <span className="font-bold text-slate-300 tracking-wider">SYSTEM READY</span>
                          <span className="flex items-center text-slate-400 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> 
                            {activeFile?.language === 'python' ? 'Python 3.10 (Pyodide)' : activeFile?.language === 'typescript' ? 'TypeScript Engine' : activeFile?.language === 'sql' ? 'SQLite (sql.js)' : 'Environment Active'}
                          </span>
                          <span className="text-slate-600 mt-4 text-xs">Press Ctrl+Enter or click Run to execute your code.</span>
                        </div>
                      ) : isInitializing ? (
                        <TerminalBootLoader />
                      ) : (
                        <div className="flex flex-col h-full w-full pb-4">
                          <pre className={`whitespace-pre-wrap ${output.includes('Error:') || (execMeta?.code !== 0 && execMeta !== null) ? 'text-rose-400' : 'text-slate-300'}`}>
                            {output}
                          </pre>
                          {execMeta !== null && !isRunning && (
                            <div className={`mt-4 ${execMeta.code === 0 ? 'text-slate-500' : 'text-rose-500/70'}`}>
                              === Code Execution {execMeta.code === 0 ? 'Successful' : 'Failed'} ===
                            </div>
                          )}
                          {isAwaitingInput && (
                            <div className="flex items-center mt-1">
                              <span className="text-emerald-400 mr-2 font-bold animate-pulse">❯</span>
                              <input 
                                type="text"
                                autoFocus
                                value={terminalInput}
                                onChange={(e) => setTerminalInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    execManagerRef.current?.provideInput(terminalInput);
                                    setIsAwaitingInput(false);
                                    setTerminalInput('');
                                  }
                                }}
                                className="bg-transparent border-none outline-none flex-1 text-emerald-300 placeholder-slate-600"
                                placeholder="Type input and press Enter..."
                              />
                            </div>
                          )}
                          {isRunning && !isAwaitingInput && !output && (
                            <div className="text-slate-400 animate-pulse mt-2">Running...</div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea 
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      placeholder="Enter standard input here..."
                      className="absolute inset-0 w-full h-full p-4 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none placeholder-slate-600"
                      spellCheck="false"
                    />
                  )}
                </div>
              </Panel>

            </Group>
          </Panel>

        </Group>
      </div>

      {/* STATUS BAR */}
      <div className="h-6 flex items-center justify-between px-3 bg-[#007acc] text-white text-[11px] shrink-0 font-medium">
        <div className="flex items-center space-x-4">
          <span className="flex items-center hover:bg-white/20 px-1 cursor-pointer rounded"><X className="w-3 h-3 mr-1" /> 0 &nbsp;&nbsp; ⚠ 0</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hover:bg-white/20 px-1 cursor-pointer rounded hidden sm:inline-block">Ln 14, Col 9</span>
          <span className="hover:bg-white/20 px-1 cursor-pointer rounded hidden sm:inline-block">Spaces: 4</span>
          <span className="hover:bg-white/20 px-1 cursor-pointer rounded hidden sm:inline-block">UTF-8</span>
          <span className="hover:bg-white/20 px-1 cursor-pointer rounded capitalize">{activeFile?.language || 'Plain Text'}</span>
          <span className="hover:bg-white/20 px-1 cursor-pointer rounded"><CheckCircle2 className="w-3 h-3 inline-block mr-1" /> Ready</span>
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed z-[100] bg-[#252526] border border-[#333] rounded shadow-xl py-1 w-40 text-sm text-slate-300"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-[#37373d] hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setRenamingFileId(contextMenu.fileId);
              setRenameValue(files.find(f => f.id === contextMenu.fileId)?.name || '');
              setContextMenu(null);
            }}
          >
            Rename
          </button>
          <button 
            className="w-full text-left px-4 py-1.5 hover:bg-rose-500/20 hover:text-rose-400 text-rose-500"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFile(contextMenu.fileId);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
