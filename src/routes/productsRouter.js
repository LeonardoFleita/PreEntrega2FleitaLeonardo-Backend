const { Router } = require("express");

const router = Router();

//Trae los productos según los filtros aplicados

router.get("/", async (req, res) => {
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

    let data = {
      status: products ? "succcess" : "error",
      payload: products.docs,
      totalPages: products.totalPages,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      prevLink: products.prevPage
        ? `/api/products?limit=${products.limit}&page=${products.prevPage}${
            category ? `&category=${category}` : ""
          }${avaiability ? `&avaiability=${avaiability}` : ""}${
            sort ? `&sort=${sort}` : ""
          }`
        : null,
      nextLink: products.nextPage
        ? `/api/products?limit=${products.limit}&page=${products.nextPage}${
            category ? `&category=${category}` : ""
          }${avaiability ? `&avaiability=${avaiability}` : ""}${
            sort ? `&sort=${sort}` : ""
          }`
        : null,
    };
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Trae el producto buscado

router.get("/:pId", async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const pId = req.params.pId;
    const product = await productManager.getProductById(pId);
    res.status(200).json({ product });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Crea un producto

router.post(`/`, async (req, res) => {
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
    res.status(200).send({ "Producto agregado": product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Modifica un producto

router.put(`/:pId`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const pId = req.params.pId;
    const newData = req.body;
    await productManager.updateProduct({ ...newData, id: pId });
    const updatedProduct = await productManager.getProductById(pId);
    res.status(200).send({ "Producto actualizado": updatedProduct });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Elimina un producto

router.delete(`/:pId`, async (req, res) => {
  try {
    const productManager = req.app.get("productManager");
    const pId = req.params.pId;
    await productManager.deleteProduct(pId);
    res.status(200).send("Producto eliminado exitosamente");
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
