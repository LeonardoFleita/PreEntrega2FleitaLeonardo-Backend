const { Router } = require("express");

const router = Router();

router.get(`/products`, async (req, res) => {
  const productManager = req.app.get("productManager");
  const limit = req.query.limit;
  const page = req.query.page;
  const sort = req.query.sort;
  const category = req.query.category;
  const avaiability = req.query.avaiability;
  const products = await productManager.getProducts(
    limit,
    page,
    sort,
    category,
    avaiability
  );
  res.render(`index`, {
    title: "Productos",
    products: products.docs,
    ws: true,
    scripts: ["index.js"],
    css: ["styles.css"],
    endPoint: "Home",
  });
});

router.get(`/realtimeproducts`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const limit = req.query.limit;
    const page = req.query.page;
    const sort = req.query.sort;
    const category = req.query.category;
    const avaiability = req.query.avaiability;
    const products = await productManager.getProducts(
      limit,
      page,
      sort,
      category,
      avaiability
    );
    res.render(`realTimeProducts`, {
      title: "Productos",
      products: products.docs,
      ws: true,
      scripts: ["realTimeProducts.js"],
      css: ["styles.css"],
      endPoint: "Realtime products",
    });
  } catch (err) {
    throw new Error(err);
  }
});

router.post(`/realtimeproducts`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const product = req.body;
    await productManager.addProduct(
      product.title,
      product.description,
      product.price,
      product.thumbnail,
      product.code,
      product.stock,
      product.category,
      product.status
    );
    const products = await productManager.getProducts();
    const addedProduct = products[products.length - 1];
    req.app.get(`ws`).emit(`newProduct`, addedProduct);
    res.status(200).send({ "Producto agregado": addedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete(`/realtimeproducts/:pId`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const pId = req.params.pId;
    await productManager.deleteProduct(pId);
    req.app.get(`ws`).emit(`deleteProduct`, pId);
    res.status(200).send("Producto eliminado exitosamente");
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post(`/realtimeproducts/delete`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    let { id } = req.body;
    id = id;
    await productManager.deleteProduct(id);
    req.app.get(`ws`).emit(`deleteProduct`, id);
    res.status(200).send("Producto eliminado exitosamente");
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/chat", (_, res) => {
  res.render("chat", {
    title: "Aplicación de chat",
    ws: true,
    useSweetAlert: true,
    scripts: ["chat.js"],
    css: ["styles.css"],
    endPoint: "Chat",
  });
});

module.exports = router;
