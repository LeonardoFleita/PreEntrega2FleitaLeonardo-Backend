const { Router } = require("express");

const router = Router();

//Trae todos los carritos

router.get(`/`, async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const carts = await cartManager.getCarts();
    res.status(200).send({ carts });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Trae el carrito buscado

router.get(`/:cId`, async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const id = req.params.cId;
    const cart = await cartManager.getCartByIdPopulate(id);
    res.status(200).json({ cart });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Crea un nuevo carrito

router.post(`/`, async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const cart = await cartManager.addCart();
    res.status(200).send({ "Carrito creado": cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Agrega un producto a un carrito especificado

router.post(`/:cId/products/:pId`, async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const cartId = req.params.cId;
    const prodId = req.params.pId;
    const addedProduct = await cartManager.addProductToCart(cartId, prodId);
    res.status(200).send({ "Producto agregado": addedProduct });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Limpia el carrito

router.delete(`/:cId`, async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const id = req.params.cId;
    const cleanedCart = await cartManager.cleanCart(id);
    res.status(200).send({ cleanedCart });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Elimina un producto del carrito

router.delete("/:cId/products/:pId", async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const cId = req.params.cId;
    const pId = req.params.pId;
    await cartManager.deleteProductFromCart(cId, pId);
    res.status(200).send(`Se eliminó el producto con id${pId} del carrito`);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Actualiza el carrito

router.put("/:cId", async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const cId = req.params.cId;
    const data = req.body;
    await cartManager.updateProductsFromCart(cId, data);
    const cart = await cartManager.getCartById(cId);
    res.status(200).json({ cart });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Actualiza las cantidades de un producto del carrito

router.put("/:cId/products/:pId", async (req, res) => {
  try {
    const cartManager = req.app.get("cartManager");
    const cId = req.params.cId;
    const pId = req.params.pId;
    const data = req.body;
    const updatedCart = await cartManager.updateQuantityProductFromCart(
      cId,
      pId,
      data
    );
    res.status(200).json({ updatedCart });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});
module.exports = router;
