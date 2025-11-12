// App.tsx
import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import CodeEditor from "./components/CodeEditor";
import FileExplorer from "./components/FileExplorer";
import Terminal from "./components/Terminal";
import UserList from "./components/UserList";
import RoomManager from "./components/RoomManager";
import LandingPage from "./components/LandingPage";
import useSocket from "./hooks/useSocket";
import { api } from "./utils/api";
import { FileSystemItem, FileItem, FolderItem, User } from "./types";
import { createFolder, flattenFileSystem } from "./utils/fileSystem";

const MainAppContent = () => {
  const navigate = useNavigate();

  // --- State ---
  const [roomId, setRoomId] = useState<string | null>(null);
  const [_userName, setUserName] = useState<string>("");
  const [isInRoom, setIsInRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // File system
  const [fileSystem, setFileSystem] = useState<{ [key: string]: FileSystemItem }>({});
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Terminal
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const { socket, isConnected, error } = useSocket();
  const files = flattenFileSystem(fileSystem);

  // --- Detect tab reload (refresh protection) ---
  useEffect(() => {
    const beforeUnload = () => {
      sessionStorage.setItem("codesync-reloading", "true");
      setIsReloading(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  // --- Auto rejoin logic (uses sessionStorage for per-tab sessions) ---
  useEffect(() => {
    const savedRoomId = sessionStorage.getItem("codesync-room");
    const savedUser = sessionStorage.getItem("codesync-user");
    const sessionFlag = sessionStorage.getItem("codesync-session-active");
    const reloadFlag = sessionStorage.getItem("codesync-reloading");

    const isSameTabRefresh = performance
      .getEntriesByType("navigation")
      .some((nav) => (nav as PerformanceNavigationTiming).type === "reload");

    if (savedRoomId && savedUser && socket) {
      if (isSameTabRefresh || sessionFlag === "true" || reloadFlag === "true") {
        socket.emit("join-room", { roomId: savedRoomId, userName: savedUser });
        setRoomId(savedRoomId);
        setUserName(savedUser);
        setIsInRoom(true);
        sessionStorage.setItem("codesync-session-active", "true");
        setTerminalOutput([`🔄 Reconnected to room ${savedRoomId}`]);
        sessionStorage.removeItem("codesync-reloading");
        setIsReloading(false);
      } else {
        sessionStorage.removeItem("codesync-room");
        sessionStorage.removeItem("codesync-user");
        sessionStorage.removeItem("codesync-session-active");
      }
    }
  }, [socket]);

  // --- Socket event handlers ---
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => setCurrentUserId(socket.id ?? ""));

    socket.on("files-sync", (syncedFiles: { [key: string]: FileItem }) => {
      const hierarchical: { [key: string]: FileSystemItem } = {};
      Object.entries(syncedFiles).forEach(([path, file]) => {
        const parts = path.split("/");
        let current = hierarchical;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) current[part] = createFolder(part);
          current = (current[part] as FolderItem).children;
        }
        current[parts[parts.length - 1]] = file;
      });
      setFileSystem(hierarchical);
      if (Object.keys(syncedFiles).length > 0 && !currentFile) {
        setCurrentFile(Object.keys(syncedFiles)[0]);
      }
    });

    socket.on("code-update", ({ fileName, content }) =>
      updateFileInHierarchy(fileName, content)
    );
    socket.on("file-created", ({ fileName, file }) =>
      addFileToHierarchy(fileName, file)
    );
    socket.on("folder-created", ({ folderName, folder }) =>
      addFolderToHierarchy(folderName, folder)
    );
    socket.on("item-deleted", ({ path }) => removeItemFromHierarchy(path));
    socket.on("item-renamed", ({ oldPath, newPath }) =>
      renameItemInHierarchy(oldPath, newPath)
    );

    socket.on("users-list", (list: User[]) => setUsers(list));

    socket.on("user-joined", ({ user, users: updatedUsers }) => {
      setUsers(updatedUsers);
      setTerminalOutput((p) => [...p, `👋 ${user.name} joined the room`]);
    });

    socket.on("user-left", ({ userId, users: updatedUsers }) => {
      setUsers((prevUsers) => {
        const leftUser = prevUsers.find((u) => u.id === userId);
        if (leftUser)
          setTerminalOutput((p) => [...p, `👋 ${leftUser.name} left the room`]);
        return updatedUsers;
      });
    });

    socket.on("code-executed", ({ output }) => {
      setTerminalOutput((p) => [...p, "> Code executed by another user:", output]);
      setIsExecuting(false);
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
      setTerminalOutput((p) => [...p, `❌ Error: ${message}`]);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket]);

  // --- File system helpers ---
  const updateFileInHierarchy = (path: string, content: string) => {
    setFileSystem((prev) => {
      const newFS = { ...prev };
      const parts = path.split("/");
      let current: any = newFS;
      for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]].children;
      const name = parts[parts.length - 1];
      if (current[name]?.type === "file") {
        current[name] = { ...current[name], content };
      }
      return newFS;
    });
  };

  const addFileToHierarchy = (path: string, file: FileItem) => {
    setFileSystem((prev) => {
      const newFS = { ...prev };
      const parts = path.split("/");
      let current: any = newFS;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = createFolder(part);
        current = current[part].children;
      }
      current[parts[parts.length - 1]] = file;
      return newFS;
    });
  };

  const addFolderToHierarchy = (path: string, folder: FolderItem) => {
    setFileSystem((prev) => {
      const newFS = { ...prev };
      const parts = path.split("/");
      let current: any = newFS;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) current[part] = createFolder(part);
        current = current[part].children;
      }
      current[parts[parts.length - 1]] = folder;
      return newFS;
    });
  };

  const removeItemFromHierarchy = (path: string) => {
    setFileSystem((prev) => {
      const newFS = JSON.parse(JSON.stringify(prev));
      const parts = path.split("/");
      let current: any = newFS;
      for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]].children;
      delete current[parts[parts.length - 1]];
      return newFS;
    });
  };

  const renameItemInHierarchy = (oldPath: string, newPath: string) => {
    setFileSystem((prev) => {
      const newFS = { ...prev };
      const oldParts = oldPath.split("/");
      let oldCurrent: any = newFS;
      for (let i = 0; i < oldParts.length - 1; i++)
        oldCurrent = oldCurrent[oldParts[i]].children;
      const item = oldCurrent[oldParts[oldParts.length - 1]];
      const newParts = newPath.split("/");
      let newCurrent: any = newFS;
      for (let i = 0; i < newParts.length - 1; i++)
        newCurrent = newCurrent[newParts[i]].children;
      newCurrent[newParts[newParts.length - 1]] = {
        ...item,
        name: newParts[newParts.length - 1],
      };
      delete oldCurrent[oldParts[oldParts.length - 1]];
      return newFS;
    });
  };

  // --- Room actions ---
  const createRoom = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.createRoom();
    } catch (err) {
      console.error("Failed to create room:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinRoom = useCallback(
    async (rId: string, uName: string) => {
      if (!socket) return;
      setIsLoading(true);
      try {
        const check = await api.checkRoom(rId);
        if (!check.exists) {
          setTerminalOutput((p) => [...p, `❌ Room ${rId} not found`]);
          return;
        }
        socket.emit("join-room", { roomId: rId, userName: uName });
        setRoomId(rId);
        setUserName(uName);
        setIsInRoom(true);
        setTerminalOutput([
          `🚀 Welcome to room ${rId}!`,
          `📝 You can start coding now...`,
        ]);
        sessionStorage.setItem("codesync-room", rId);
        sessionStorage.setItem("codesync-user", uName);
      } catch (err) {
        console.error("Join room error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [socket]
  );

  // --- Leave Room ---
  const leaveRoom = useCallback(() => {
    if (socket && roomId && !isReloading) socket.emit("leave-room", { roomId });
    sessionStorage.removeItem("codesync-room");
    sessionStorage.removeItem("codesync-user");
    sessionStorage.removeItem("codesync-session-active");

    setIsLeaving(true);
    setTimeout(() => {
      setIsInRoom(false);
      setRoomId(null);
      setUserName("");
      setUsers([]);
      setFileSystem({});
      setCurrentFile(null);
      setTerminalOutput(["👋 You left the room."]);
      navigate("/");
      setIsLeaving(false);
    }, 800);
  }, [socket, roomId, navigate, isReloading]);

  // --- Code handling ---
  const handleCodeChange = useCallback(
    (content: string) => {
      if (!currentFile || !socket || !roomId) return;
      updateFileInHierarchy(currentFile, content);
      socket.emit("code-change", { fileName: currentFile, content, roomId });
    },
    [currentFile, socket, roomId]
  );

  const handleCursorChange = useCallback(
    (pos: any) => {
      if (socket && roomId) socket.emit("cursor-change", { position: pos, roomId });
    },
    [socket, roomId]
  );

  const handleCodeExecute = useCallback(
    async (code: string, language: string) => {
      if (!roomId) return;
      setIsExecuting(true);
      setTerminalOutput((p) => [...p, `> Executing ${language} code...`]);
      try {
        const result = await api.executeCode(code, language, roomId);
        setTerminalOutput((p) => [...p, result.output]);
      } catch (e) {
        setTerminalOutput((p) => [...p, `❌ Execution failed: ${String(e)}`]);
      } finally {
        setIsExecuting(false);
      }
    },
    [roomId]
  );

  // --- Error UI ---
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Connection Error
          </h2>
          <p>{error}</p>
          <p className="text-gray-600 mt-2">
            Ensure backend server runs on port 3001
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInRoom) {
    return (
      <RoomManager
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        isLoading={isLoading}
      />
    );
  }

  // --- Main UI ---
  return (
    <div
      className={`h-screen flex flex-col bg-gray-100 relative ${
        isLeaving
          ? "opacity-0 transition-opacity duration-700"
          : "opacity-100 transition-opacity duration-700"
      }`}
    >
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">CodeSync</h1>
          <span className="text-sm text-gray-500">
            Room:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {roomId}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={leaveRoom}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
          >
            Leave Room
          </button>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 border-r border-gray-300">
          <FileExplorer
            items={fileSystem}
            currentFile={currentFile}
            onFileSelect={(f) => setCurrentFile(f)}
            onFileCreate={(p, n) =>
              socket?.emit("create-file", {
                fileName: `${p ? p + "/" : ""}${n}`,
                roomId,
              })
            }
            onFolderCreate={(p, n) =>
              socket?.emit("create-folder", {
                folderName: `${p ? p + "/" : ""}${n}`,
                folder: createFolder(n),
                roomId,
              })
            }
            onItemDelete={(path) =>
              socket?.emit("delete-item", { path, roomId })
            }
            onItemRename={(oldP, newN) => {
              const parts = oldP.split("/");
              parts[parts.length - 1] = newN;
              socket?.emit("rename-item", {
                oldPath: oldP,
                newPath: parts.join("/"),
                roomId,
              });
            }}
            onFolderToggle={() => {}}
            onOpenFolder={() => {}}
          />
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {currentFile && files[currentFile] ? (
            <>
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
                <span className="text-sm font-medium">{currentFile}</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <div className="flex-1">
                <CodeEditor
                  fileName={currentFile}
                  content={files[currentFile]?.content || ""}
                  language="javascript"
                  onChange={handleCodeChange}
                  onCursorChange={handleCursorChange}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No file selected</p>
                <p className="text-sm">
                  Create or select a file from the explorer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Terminal + Users */}
        <div className="w-80 flex flex-col border-l border-gray-300">
          <div className="flex-1 border-b border-gray-300">
            <Terminal
              output={terminalOutput}
              isExecuting={isExecuting}
              onExecute={handleCodeExecute}
              currentFile={currentFile}
              files={files}
            />
          </div>
          <div className="h-64">
            <UserList users={users} currentUserId={currentUserId} />
          </div>
        </div>
      </div>

      {isLeaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 text-white text-lg font-semibold animate-pulse">
          Leaving room...
        </div>
      )}
    </div>
  );
};

// --- Router Wrapper ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/*" element={<MainAppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
