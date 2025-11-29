// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://codecollob-frontend.onrender.com"  // ⭐ Your Render frontend URL
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://codecollob-frontend.onrender.com"
    ],
    credentials: true,
  })

);
app.use(express.json());

// In-memory storage
const rooms = new Map();
const roomFileSystem = new Map();
const roomCleanupTimers = new Map();

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running fine 🚀" });
});

// --- Create New Room ---
app.post("/api/rooms/create", (req, res) => {
  const roomId = uuidv4().substring(0, 8);

  rooms.set(roomId, {
    id: roomId,
    users: [],
    createdAt: new Date(),
    hostId: null,
    hostName: null,
  });

  // Default file
  roomFileSystem.set(roomId, {
    "main.js": {
      name: "main.js",
      content:
        '// Welcome to CodeSync!\nconsole.log("Hello, world from CodeSync!");',
      type: "file",
    },
  });

  console.log(`✅ Room ${roomId} created`);
  res.json({ roomId, message: "Room created successfully" });
});

// --- Check Room Exists ---
app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  if (rooms.has(roomId)) {
    res.json({ exists: true });
  } else {
    res.status(404).json({ exists: false, message: "Room not found" });
  }
});

// --- Execute Code ---
app.post("/api/execute", (req, res) => {
  const { code, language, roomId } = req.body;

  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: "Room not found" });
  }

  let child;
  let output = "";
  let errorOutput = "";

  const timeout = setTimeout(() => {
    if (child) child.kill();
    res.json({
      output: output + "\n[Execution timed out after 10 seconds]",
      error: true,
    });
  }, 10000);

  const sendResult = (finalOutput, code) => {
    clearTimeout(timeout);
    io.to(roomId).emit("code-executed", {
      output: finalOutput,
      exitCode: code,
    });
    res.json({
      output: finalOutput,
      exitCode: code,
      error: code !== 0,
    });
  };

  try {
    if (language === "javascript") {
      child = spawn("node", ["-e", code]);
    } else if (language === "python") {
      const cmd = process.platform === "win32" ? "python" : "python3";
      child = spawn(cmd, ["-c", code]);
    } else if (language === "c" || language === "cpp") {
      const isCpp = language === "cpp";
      const tmpFile = tmp.fileSync({ postfix: isCpp ? ".cpp" : ".c" });

      fs.writeFileSync(tmpFile.name, code);

      const exeFile = tmp.tmpNameSync({
        postfix: process.platform === "win32" ? ".exe" : "",
      });

      const compiler = isCpp ? "g++" : "gcc";
      const compile = spawn(compiler, [tmpFile.name, "-o", exeFile]);

      compile.stderr.on("data", (d) => (errorOutput += d.toString()));

      compile.on("close", (codeVal) => {
        if (codeVal !== 0)
          return sendResult("Compilation failed:\n" + errorOutput, codeVal);

        child = spawn(exeFile);

        child.stdout.on("data", (d) => (output += d.toString()));
        child.stderr.on("data", (d) => (errorOutput += d.toString()));

        child.on("close", (runCode) => {
          sendResult(output + errorOutput, runCode);
          fs.unlinkSync(tmpFile.name);
          fs.unlinkSync(exeFile);
        });
      });
      return;
    } else if (language === "java") {
      const tmpDir = tmp.dirSync();
      const javaFile = path.join(tmpDir.name, "Main.java");

      fs.writeFileSync(javaFile, code);

      const compile = spawn("javac", [javaFile]);
      compile.stderr.on("data", (d) => (errorOutput += d.toString()));

      compile.on("close", (cCode) => {
        if (cCode !== 0)
          return sendResult("Compilation failed:\n" + errorOutput, cCode);

        child = spawn("java", ["-cp", tmpDir.name, "Main"]);

        child.stdout.on("data", (d) => (output += d.toString()));
        child.stderr.on("data", (d) => (errorOutput += d.toString()));

        child.on("close", (runCode) => {
          sendResult(output + errorOutput, runCode);
          fs.rmSync(tmpDir.name, { recursive: true, force: true });
        });
      });
      return;
    } else if (language === "go") {
      const tmpFile = tmp.fileSync({ postfix: ".go" });
      fs.writeFileSync(tmpFile.name, code);

      child = spawn("go", ["run", tmpFile.name]);

      child.stdout.on("data", (d) => (output += d.toString()));
      child.stderr.on("data", (d) => (errorOutput += d.toString()));

      child.on("close", (runCode) => {
        sendResult(output + errorOutput, runCode);
        fs.unlinkSync(tmpFile.name);
      });
      return;
    } else {
      return sendResult("Unsupported language: " + language, 1);
    }

    child.stdout.on("data", (d) => (output += d.toString()));
    child.stderr.on("data", (d) => (errorOutput += d.toString()));

    child.on("close", (c) =>
      sendResult(output + (errorOutput ? "\n" + errorOutput : ""), c)
    );
  } catch (err) {
    clearTimeout(timeout);
    res.json({ output: "Execution error: " + err.message, error: true });
  }
});

// --- Socket.IO Events ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", ({ roomId, userName }) => {
    if (!rooms.has(roomId)) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;

    const room = rooms.get(roomId);

    // ⭐ Host Reconnect Fix
    if (room.hostName === userName) {
      room.hostId = socket.id;
      console.log(`🔄 Host reconnected → new hostId = ${socket.id}`);
    }

    // ⭐ First user becomes host
    if (!room.hostId) {
      room.hostId = socket.id;
      room.hostName = userName;
    }

    // Cancel cleanup
    if (roomCleanupTimers.has(roomId)) {
      clearTimeout(roomCleanupTimers.get(roomId));
      roomCleanupTimers.delete(roomId);
    }

    // Add user
    if (!room.users.find((u) => u.id === socket.id)) {
      room.users.push({ id: socket.id, name: userName, joinedAt: new Date() });
    }

    // Send files + user list + host
    socket.emit("files-sync", roomFileSystem.get(roomId) || {});
    socket.emit("users-list", {
      users: room.users,
      hostId: room.hostId
    });

    socket.to(roomId).emit("user-joined", {
      user: { id: socket.id, name: userName },
      users: room.users,
      hostId: room.hostId
    });
  });


  // Explicit leave
  socket.on("leave-room", ({ roomId }) => {
    if (!rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.users = room.users.filter((u) => u.id !== socket.id);

    socket.leave(roomId);

    io.to(roomId).emit("user-left", {
      userId: socket.id,
      users: room.users,
      hostId: room.hostId,
    });

    // Do NOT change host if host left (persistent host)
    if (socket.id === room.hostId) {
      room.hostId = room.hostId;
    }

    if (room.users.length === 0) startRoomCleanup(roomId);
  });

  // Code change
  socket.on("code-change", ({ fileName, content, roomId }) => {
    if (!roomFileSystem.has(roomId)) roomFileSystem.set(roomId, {});
    const files = roomFileSystem.get(roomId);
    if (files[fileName]) files[fileName].content = content;
    socket.to(roomId).emit("code-update", { fileName, content });
  });

  // Cursor change
  socket.on("cursor-change", ({ position, roomId }) => {
    socket.to(roomId).emit("cursor-update", {
      userId: socket.id,
      userName: socket.userName,
      position,
    });
  });

  // Create file
  socket.on("create-file", ({ fileName, content = "", roomId }) => {
    if (!roomFileSystem.has(roomId)) roomFileSystem.set(roomId, {});
    const files = roomFileSystem.get(roomId);

    files[fileName] = {
      name: fileName,
      content,
      type: "file",
      createdAt: new Date(),
    };

    io.to(roomId).emit("file-created", { fileName, file: files[fileName] });
  });

  // Create folder
  socket.on("create-folder", ({ folderName, folder, roomId }) => {
    if (!roomFileSystem.has(roomId)) roomFileSystem.set(roomId, {});
    const files = roomFileSystem.get(roomId);

    files[folderName] = {
      name: folderName,
      type: "folder",
      children: {},
      expanded: true,
      createdAt: new Date(),
    };

    io.to(roomId).emit("folder-created", {
      folderName,
      folder: files[folderName],
    });
  });

  // DELETE item (folder + all children)
  socket.on("delete-item", ({ path, roomId }) => {
    if (!roomFileSystem.has(roomId)) return;

    const files = roomFileSystem.get(roomId);

    Object.keys(files).forEach((key) => {
      if (key === path || key.startsWith(path + "/")) {
        delete files[key];
      }
    });

    io.to(roomId).emit("item-deleted", { path });
  });

  // Rename
  socket.on("rename-item", ({ oldPath, newPath, roomId }) => {
    if (!roomFileSystem.has(roomId)) return;

    const files = roomFileSystem.get(roomId);

    if (files[oldPath]) {
      const item = files[oldPath];
      const newName = newPath.split("/").pop();
      files[newPath] = { ...item, name: newName };
      delete files[oldPath];

      io.to(roomId).emit("item-renamed", { oldPath, newPath });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (!socket.roomId || !rooms.has(socket.roomId)) return;

    const room = rooms.get(socket.roomId);

    room.users = room.users.filter((u) => u.id !== socket.id);

    io.to(socket.roomId).emit("user-left", {
      userId: socket.id,
      users: room.users,
      hostId: room.hostId,
    });

    // Host does NOT change
    if (socket.id === room.hostId) {
      room.hostId = room.hostId;
    }

    if (room.users.length === 0) startRoomCleanup(socket.roomId);
  });
});

// Room cleanup
function startRoomCleanup(roomId) {
  if (roomCleanupTimers.has(roomId)) return;

  console.log(`⏳ Room ${roomId} empty. Cleanup in 5 minutes...`);

  const timer = setTimeout(() => {
    const room = rooms.get(roomId);
    if (room && room.users.length === 0) {
      rooms.delete(roomId);
      roomFileSystem.delete(roomId);
      roomCleanupTimers.delete(roomId);
      console.log(`🗑 Room ${roomId} deleted.`);
    }
  }, 300000);

  roomCleanupTimers.set(roomId, timer);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
});
