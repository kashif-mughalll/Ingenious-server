var Users = [];
const Port = 5000;
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connection " + socket.id);

  // Authentication
  socket.on("auth", (uid) => Authentication(uid, socket));

  // Disconnection
  socket.on("disconnect", () => {
    console.log("Disconnected " + socket.id);
    removeUser(socket.id);
  });

  // Calling a user
  socket.on("callUser", (data) => callUser(data, socket));

  // Answering a call
  socket.on("answerCall", (data) => AnswerCall(data));
});

server.listen(Port, () => console.log("server is running on port 5000"));

var Authentication = (uid, socket) => {
  if (getIndexUID(uid) != null ) Users[getIndexUID(uid)].sid = socket.id;
  else {
    Users.push({
      uid: uid,
      sid: socket.id,
    });
    console.log("User pushed")
    console.log(Users[0])
    console.log(Users[1])
  }
  socket.emit("getSid", socket.id);
};

var callUser = (UserTocall, socket) => {
  if (getIndexUID(UserTocall.to) != null) {
    // User is online
    io.to(Users[getIndexUID(UserTocall.to)].sid).emit(
      "incomingCall",
      UserTocall
    );
  } else {
    console.log("\nbhund user is offline\n");
    //User is offline
    socket.emit("callFailed", {
      ...UserTocall,
      reason: "user is either offline or not connected to server",
    });
  }
};

var AnswerCall = (answer) => {
  console.log(answer.to +"  teen")
  if (getIndexUID(answer.to) != null)
    io.to(Users[getIndexUID(answer.to)].sid).emit(
      "callAccepted",
      answer.signalData
    );
  else console.error("uid not found another bhund");
};

var UserTocall = {
  caller: {
    id: "uid of caller",
    name: "kashif etc",
    picture: "url",
  },
  signalData: "Peer to peer data element",
  to: "uid of second person you are calling",
};

var Answer = {
  signalData: "Peer to peer data element",
  to: "uid of caller person from whome you have recieved call",
};

var removeUser = (sid) => {
  if (getIndexSID(sid) != null) Users.splice(getIndexSID(sid), 1);
  else console.error("Sid not found");
};

var getIndexSID = (sid) => {
  for (let i = 0; i < Users.length; i++) if (Users[i].sid == sid) return i;
  return null;
};

var getIndexUID = (uid) => {
  for (let i = 0; i < Users.length; i++) if (Users[i].uid == uid) return i;
  return null;
};
