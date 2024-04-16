const socket = io();

let username;

const chatBox = document.getElementById(`chatBox`);
const messageLogs = document.getElementById(`messageLogs`);

Swal.fire({
  title: "Ingresa un username",
  input: "text",
  text: "Debes identificarte",
  inputValidator: (value) => {
    return !value && "Debes escribir un username válido";
  },
  allowOutsideClick: false,
}).then((res) => {
  username = res.value;
  console.log("Usuario identificado como " + username);
  socket.emit("newUser", username);
});

socket.on("newUserConnected", (user) => {
  Swal.fire({
    text: `${user} se ha conectado`,
    toast: true,
    position: "top-right",
  });
});

chatBox.addEventListener(`keyup`, (evt) => {
  if (evt.key === `Enter`) {
    const message = chatBox.value;
    if (message.trim().length > 0) {
      socket.emit(`message`, { username, message });
    }
  }
});

socket.on("message", (data) => {
  const { username, message } = data;
  messageLogs.innerHTML += `${username} dice: ${message}</br>`;
});
