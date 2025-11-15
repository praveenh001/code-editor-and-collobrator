
# 🚀 CodeSync – Real-Time Collaborative Code Editor

A full-stack, real-time collaborative coding platform built using **React + Vite**, **Node.js**, **Express**, **Socket.IO**, and the **Monaco Editor**, with features like shared file system, code execution, and room-based collaboration.

---

## 🧩 Features

### 🌐 Real-Time Collaboration
- Multi-user live editing  
- Live cursor indicators  
- Real-time user join/leave updates  
- Auto-sync editor content  

### 🗂️ Shared File System
- Create / rename / delete files  
- Create nested folders  
- Sync instantly for all users  
- File & folder download  

### 💻 Multi-Language Code Execution
Supports:
- JavaScript  
- Python  
- C  
- C++  
- Java  
- Go  

Executed safely using backend child-process handling.

### 🧭 Room System
- Create unique room with ID  
- Join via room ID  
- Wrong ID → error message  
- Auto-reconnect after page refresh  
- Session stored per browser tab  

### 💬 Integrated Terminal
- Execution output  
- System messages  
- Download output  
- Syntax-colored logs  

### 🎨 UI/UX
- TailwindCSS-based design  
- Modern VSCode-like layout  
- Animated landing page  
- Clean dashboard components  

---

## 📁 Project Structure

```
root/
├── backend/
│   ├── server.js
│   ├── package.json
│
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx
│   │   ├── FileExplorer.tsx
│   │   ├── Terminal.tsx
│   │   ├── UserList.tsx
│   │   ├── RoomManager.tsx
│   │   ├── LandingPage.tsx
│   ├── hooks/
│   │   └── useSocket.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── fileSystem.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│
├── package.json
├── tsconfig.json
├── index.html
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the project
```bash
git clone https://github.com/praveenh001/code-editor-and-collobrator.git
cd codesync
```

### 🖥️ Backend Setup
```bash
cd backend
npm install
npm start
```

Backend runs at:
```
http://localhost:3001
```

### 🖥️ Frontend Setup
```bash
npm install
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## 🔧 How CodeSync Works

### 1️⃣ Room Creation / Join
- Frontend calls `/api/rooms/create` → backend creates unique room ID  
- User enters username + room ID  
- Backend validates & adds user to the room  
- All users are synced instantly  

### 2️⃣ File System Synchronization
Frontend emits events:
- `file-created`
- `folder-created`
- `code-update`
- `item-deleted`
- `item-renamed`

Backend broadcasts updates to all users in the same room.

### 3️⃣ Code Execution Flow
- Frontend sends file content + language  
- Backend:
  - Creates temporary file  
  - Executes using correct runtime  
  - Captures stdout + stderr  
  - Returns output to terminal  
  - Cleans up temp files  

Timeout: **10 seconds**

---

## 🛠️ Technologies Used

### Frontend
- React 18  
- Vite  
- TypeScript  
- Monaco Editor  
- TailwindCSS  
- Lucide Icons  

### Backend
- Node.js  
- Express  
- Socket.IO  
- UUID  
- tmp  
- Child process executors  

---



## 📸 Screenshots
<img width="1919" height="1070" alt="Screenshot 2025-11-15 224802" src="https://github.com/user-attachments/assets/e23179e1-793d-4d6b-8f0a-705365435e19" />


<img width="1919" height="1078" alt="image" src="https://github.com/user-attachments/assets/8cac2827-98b3-4bfe-9650-ead7a68c0939" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/cc815907-05a5-45e3-b0d7-03fff5cb767c" />


---

## 🔮 Future Enhancements
- Built-in chat  
- Authentication system  
- AI-assisted coding  
- Cloud deployment  
- CRDT-based syncing  
- Docker sandbox for secure execution  

---

## 🤝 Contributing
Pull requests are welcome!

## ⭐ Support
If this project helped you, please ⭐ the repo!
