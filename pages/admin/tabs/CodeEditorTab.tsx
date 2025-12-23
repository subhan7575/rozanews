
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storageService';
import { VirtualFile } from '../../../types';

const CodeEditorTab: React.FC = () => {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [currentFile, setCurrentFile] = useState<VirtualFile | null>(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    setFiles(StorageService.getFiles());
  }, []);

  const loadFile = (file: VirtualFile) => {
    setCurrentFile(file);
    setFileContent(file.content);
  };

  const saveFileContent = () => {
    if (!currentFile) return;
    StorageService.saveFile({ ...currentFile, content: fileContent });
    alert("Saved");
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-[600px] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex overflow-hidden animate-fade-in">
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 p-4 overflow-y-auto">
            <h4 className="font-bold text-xs uppercase text-gray-500 mb-4">Project Files</h4>
            <div className="space-y-1">
                {files.map(file => (
                    <button 
                    key={file.path}
                    onClick={() => loadFile(file)}
                    className={`w-full text-left px-3 py-2 rounded text-sm truncate font-mono ${currentFile?.path === file.path ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                    {file.name}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <span className="font-mono text-sm font-bold dark:text-white">{currentFile?.path || 'Select a file'}</span>
                <button onClick={saveFileContent} disabled={!currentFile} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                    Save Changes
                </button>
            </div>
            <textarea 
                className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm outline-none resize-none"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                spellCheck={false}
            />
        </div>
    </div>
  );
};

export default CodeEditorTab;
