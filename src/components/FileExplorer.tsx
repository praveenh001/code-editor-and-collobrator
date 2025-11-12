// FileExplorer.tsx

import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen,
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  FileText,
  Download,
  FolderPlus,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { FileSystemItem } from '../types'; // ✅ Removed unused FileItem, FolderItem
import { downloadFile, downloadFolder, getFileExtension } from '../utils/fileSystem';

interface FileExplorerProps {
  items: { [key: string]: FileSystemItem };
  currentFile: string | null;
  onFileSelect: (filePath: string) => void;
  onFileCreate: (path: string, name: string) => void;
  onFolderCreate: (path: string, name: string) => void;
  onItemDelete: (path: string) => void;
  onItemRename: (oldPath: string, newName: string) => void;
  onFolderToggle: (path: string) => void;
  onOpenFolder: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  items,
  currentFile,
  onFileSelect,
  onFileCreate,
  onFolderCreate,
  onItemDelete,
  onItemRename,
  onFolderToggle,
  onOpenFolder
}) => {
  const [showCreateInput, setShowCreateInput] = useState<{ type: 'file' | 'folder', path: string } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleCreateItem = () => {
    if (!showCreateInput || !newItemName.trim()) return;
    
    // ❌ Removed unused variable 'fullPath'
    if (showCreateInput.type === 'file') {
      onFileCreate(showCreateInput.path, newItemName.trim());
    } else {
      onFolderCreate(showCreateInput.path, newItemName.trim());
    }
    
    setNewItemName('');
    setShowCreateInput(null);
  };

  const handleRenameItem = (itemPath: string) => { // ✅ renamed 'path' → 'itemPath' to avoid shadowing
    if (editItemName.trim() && editItemName !== itemPath.split('/').pop()) {
      onItemRename(itemPath, editItemName.trim());
    }
    setEditingItem(null);
    setEditItemName('');
  };

  const startRename = (itemPath: string) => {
    setEditingItem(itemPath);
    setEditItemName(itemPath.split('/').pop() || '');
    setShowMenu(null);
  };

  const handleDownload = (itemPath: string, item: FileSystemItem) => {
    if (item.type === 'file') {
      downloadFile(item.name, item.content);
    } else {
      downloadFolder(item.name, item.children);
    }
    setShowMenu(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName);
    
    const iconMap: { [key: string]: { icon: React.ReactNode, color: string } } = {
      'js': { icon: <FileText className="w-4 h-4" />, color: 'text-yellow-400' },
      'jsx': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400' },
      'ts': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-500' },
      'tsx': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-500' },
      'py': { icon: <FileText className="w-4 h-4" />, color: 'text-green-400' },
      'java': { icon: <FileText className="w-4 h-4" />, color: 'text-red-400' },
      'cpp': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-300' },
      'c': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-300' },
      'go': { icon: <FileText className="w-4 h-4" />, color: 'text-cyan-400' },
      'rs': { icon: <FileText className="w-4 h-4" />, color: 'text-orange-400' },
      'php': { icon: <FileText className="w-4 h-4" />, color: 'text-purple-400' },
      'rb': { icon: <FileText className="w-4 h-4" />, color: 'text-red-300' },
      'html': { icon: <FileText className="w-4 h-4" />, color: 'text-orange-400' },
      'css': { icon: <FileText className="w-4 h-4" />, color: 'text-blue-300' },
      'json': { icon: <FileText className="w-4 h-4" />, color: 'text-green-400' },
      'md': { icon: <FileText className="w-4 h-4" />, color: 'text-gray-400' }
    };
    
    const iconData = iconMap[extension] || { icon: <File className="w-4 h-4" />, color: 'text-gray-400' };
    
    return (
      <span className={iconData.color}>
        {iconData.icon}
      </span>
    );
  };

  const renderItem = (name: string, item: FileSystemItem, itemPath: string, depth: number = 0) => { // ✅ renamed 'path' → 'itemPath'
    const isSelected = currentFile === itemPath;
    const isEditing = editingItem === itemPath;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={itemPath}>
        <div
          className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-colors group ${
            isSelected && item.type === 'file'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (item.type === 'file') {
              onFileSelect(itemPath);
            } else {
              onFolderToggle(itemPath);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {item.type === 'folder' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFolderToggle(itemPath);
                }}
                className="p-0.5 hover:bg-gray-600 rounded"
              >
                {item.expanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            
            {item.type === 'folder' ? (
              item.expanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )
            ) : (
              getFileIcon(name)
            )}
            
            {isEditing ? (
              <input
                type="text"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                className="flex-1 px-1 text-xs bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleRenameItem(itemPath);
                  if (e.key === 'Escape') {
                    setEditingItem(null);
                    setEditItemName('');
                  }
                }}
                onBlur={() => handleRenameItem(itemPath)}
                autoFocus
              />
            ) : (
              <span className="text-sm truncate">{name}</span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(showMenu === itemPath ? null : itemPath);
            }}
            className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>

        {showMenu === itemPath && (
          <div className="absolute right-2 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-20 min-w-32">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startRename(itemPath);
              }}
              className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit className="w-3 h-3" />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(itemPath, item);
              }}
              className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            {item.type === 'folder' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateInput({ type: 'file', path: itemPath });
                    setShowMenu(null);
                  }}
                  className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  New File
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateInput({ type: 'folder', path: itemPath });
                    setShowMenu(null);
                  }}
                  className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 flex items-center gap-2"
                >
                  <FolderPlus className="w-3 h-3" />
                  New Folder
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${name}"?`)) {
                  onItemDelete(itemPath);
                }
                setShowMenu(null);
              }}
              className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}

        {item.type === 'folder' && item.expanded && (
          <div>
            {Object.entries(item.children).map(([childName, childItem]) =>
              renderItem(childName, childItem, `${itemPath}/${childName}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4 border-r border-gray-700 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200">Explorer</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowCreateInput({ type: 'file', path: '' })}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateInput({ type: 'folder', path: '' })}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Create new folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          {/* <button
            onClick={onOpenFolder}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Open local folder"
          >
            <FolderOpen className="w-4 h-4" />
          </button> */}
        </div>
      </div>

      {showCreateInput && (
        <div className="mb-3 p-2 bg-gray-800 rounded">
          <div className="text-xs text-gray-400 mb-1">
            Create new {showCreateInput.type} {showCreateInput.path && `in ${showCreateInput.path}`}
          </div>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Enter ${showCreateInput.type} name...`}
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreateItem();
              if (e.key === 'Escape') {
                setShowCreateInput(null);
                setNewItemName('');
              }
            }}
            autoFocus
          />
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleCreateItem}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateInput(null);
                setNewItemName('');
              }}
              className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1 overflow-y-auto">
        {Object.entries(items).map(([name, item]) =>
          renderItem(name, item, name)
        )}
      </div>

      {Object.keys(items).length === 0 && !showCreateInput && (
        <div className="text-center text-gray-500 mt-8">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No files yet</p>
          <p className="text-xs">Click + to create one</p>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
