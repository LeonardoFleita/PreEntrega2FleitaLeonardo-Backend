const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const productsRouter = require(`${__dirname}/routes/productsRouter`);
const cartsRouter = require(`${__dirname}/routes/cartsRouter`);
const CartManager = require(`${__dirname}/dao/dbManagers/cartManager`);
const viewsRouter = require(`${__dirname}/routes/viewsRouter`);
const ProductManager = require(`${__dirname}/dao/dbManagers/productManager`);
const MessageModel = require("./dao/models/message.model");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/../public`));

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, `${__dirname}/views`);
app.set(`view engine`, `handlebars`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.use(`/`, viewsRouter);

const httpServer = app.listen(8080, () => {
  console.log("Servidor listo");
});

const wsServer = new Server(httpServer);

app.set(`ws`, wsServer);

const execute = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://leofleita:leofleita@proyectobackend.g9zrgun.mongodb.net/?retryWrites=true&w=majority&appName=proyectoBackend",
      {
        dbName: "ecommerce",
      }
    );
    const productManager = new ProductManager(
      `${__dirname}/../assets/products.json`
    );
    await productManager.initialize();
    app.set("productManager", productManager);
    const cartManager = new CartManager(`${__dirname}/../assets/carts.json`);
    await cartManager.initialize();
    app.set("cartManager", cartManager);

    wsServer.on(`connection`, async (clientSocket) => {
      console.log(`Nuevo usuario conectado, id: `, clientSocket.id);

      const messagesMongo = await MessageModel.find();
      const messagesHistory = messagesMongo.map((m) => {
        return { username: m.username, message: m.message };
      });

      for (const data of messagesHistory) {
        clientSocket.emit("message", data);
      }

      clientSocket.on("newUser", (data) => {
        clientSocket.broadcast.emit("newUserConnected", data);
      });
      clientSocket.on(`message`, async (data) => {
        const { username, message } = data;

        await MessageModel.create({ username, message });

        wsServer.emit(`message`, data);
      });
    });
  } catch (err) {
    console.error(err);
  }
};

execute();
