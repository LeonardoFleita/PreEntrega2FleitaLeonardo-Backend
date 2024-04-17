const ProductModel = require("../models/product.model");

class ProductManager {
  constructor() {}

  async initialize() {
    if (ProductModel.db.readyState !== 1) {
      throw new Error("must connect to mongodb!");
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
      await ProductModel.create({
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
        status,
      });
    } catch (err) {
      throw Error(err);
    }
  }

  async getProductById(prodId) {
    try {
      const findedProduct = await ProductModel.find({ _id: prodId });
      console.log(findedProduct);
      if (findedProduct.length < 1) {
        throw new Error(`No existe un producto con ese id`);
      }
      return findedProduct;
    } catch (err) {
      throw Error(err);
    }
  }

  async updateProduct(product) {
    try {
      const findedProduct = await this.getProductById(product.id);
      if (findedProduct.length < 1) {
        throw new Error();
      }
      await ProductModel.updateOne({ _id: product.id }, { $set: product });
    } catch (err) {
      throw Error(err);
    }
  }

  async deleteProduct(prodId) {
    try {
      const findedProduct = await this.getProductById(prodId);
      console.log(findedProduct);
      if (findedProduct.length < 1) {
        throw new Error();
      }
      await ProductModel.deleteOne({ _id: prodId });
    } catch (err) {
      throw Error(err);
    }
  }

  //El filtro de avaiability devuelve los productos que tengan un stock igual o superior al número solicitado en params

  async getProducts(limit, page, sort, category, avaiability) {
    try {
      limit = limit ? parseInt(limit) : 10;
      page = page ? parseInt(page) : 1;
      let filter = {};
      category && (filter = { ...filter, category });
      avaiability &&
        (filter = { ...filter, stock: { $gte: parseInt(avaiability) } });
      let paginateOptions = { limit, page, lean: true };
      if ((sort && sort === "asc") || sort === "desc") {
        paginateOptions.sort = { price: sort === "desc" ? -1 : 1 };
      }
      const products = await ProductModel.paginate(filter, paginateOptions);
      return products;
    } catch (err) {
      return [];
    }
  }
}

module.exports = ProductManager;
