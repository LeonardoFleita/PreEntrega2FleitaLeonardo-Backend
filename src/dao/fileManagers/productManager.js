const fs = require("fs");

class ProductManager {
  static #lastProductId = 0;

  constructor(path) {
    this.path = path;
    this.products = [];
  }

  async initialize() {
    try {
      const fileProducts = await this.getProducts();
      this.products = fileProducts;
    } catch (err) {
      console.log(err);
    }
  }

  async getNewId() {
    try {
      const quantity = this.products.length;
      if (quantity < 1) {
        ProductManager.#lastProductId = 0;
      } else {
        const lastId = this.products[quantity - 1].id;
        ProductManager.#lastProductId = lastId;
      }
      ProductManager.#lastProductId++;
      const id = ProductManager.#lastProductId;
      return id;
    } catch (err) {
      console.log(err);
    }
  }

  async addProduct(
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
    category,
    status = true
  ) {
    try {
      const previousCode = this.products.find((prod) => prod.code === code);
      if (previousCode) {
        throw new Error(`Ya existe un producto con el código ingresado`);
      }

      if (!title || !description || !price || !code || !stock || !category) {
        throw new Error(
          `Falta información sobre el producto! Uno o más de los siguientes campos no se han especificado: Nombre, Descripción, precio, código, stock.
  Por favor verifique la información y vuelva a intentar el proceso de carga`
        );
      }
      const product = {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
        status,
        id: await this.getNewId(),
      };

      this.products.push(product);
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t"),
        "utf-8"
      );
      console.log("Producto agregado exitosamente!");
    } catch (err) {
      throw Error(err);
    }
  }

  async getProductById(prodId) {
    try {
      const pId = parseInt(prodId);
      const findedProduct = this.products.find((prod) => prod.id === pId);
      if (!findedProduct) {
        throw new Error(`No existe un producto con ese id`);
      }
      console.log("El producto que busca es:", "\n", findedProduct);
      return findedProduct;
    } catch (err) {
      throw Error(err);
    }
  }

  async updateProduct(product) {
    try {
      const pId = parseInt(product.id);
      const productIdx = this.products.findIndex((prod) => prod.id === pId);
      if (productIdx < 0) {
        throw new Error("El producto que quiere actualizar no existe");
      }
      const updatedProduct = {
        ...this.products[productIdx],
        ...product,
        id: pId,
      };
      this.products[productIdx] = updatedProduct;

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t")
      );
      console.log("Producto actualizado exitosamente!");
    } catch (err) {
      throw Error(err);
    }
  }

  async deleteProduct(prodId) {
    try {
      const pId = parseInt(prodId);
      const productIdx = this.products.findIndex((prod) => prod.id === pId);
      if (productIdx < 0) {
        throw new Error("No existe ningún producto con ese id");
      }
      this.products.splice(productIdx, 1);
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t")
      );
      console.log("Producto eliminado exitosamente!");
    } catch (err) {
      throw Error(err);
    }
  }

  async getProducts() {
    try {
      const fileProducts = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(fileProducts);
    } catch (err) {
      return [];
    }
  }

  getProductsFromMemory() {
    return this.products;
  }
}

module.exports = ProductManager;

//EJECUCIÓN
// const execute = async () => {
//   const productManager = new ProductManager("../assets/products.json");
//   await productManager.initialize();
//   await productManager.addProduct(
//     "prueba",
//     "prueba",
//     200,
//     [],

//   );
// };

// execute();
