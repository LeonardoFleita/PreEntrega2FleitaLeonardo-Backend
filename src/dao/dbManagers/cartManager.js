const CartModel = require(`../models/cart.model`);
const ProductModel = require("../models/product.model");

class CartManager {
  constructor() {}

  async initialize() {
    if (CartModel.db.readyState !== 1) {
      throw new Error("must connect to mongodb!");
    }
  }

  async getCarts() {
    try {
      const carts = CartModel.find();
      return (await carts).map((c) => c.toObject({ virtuals: true }));
    } catch (err) {
      return [];
    }
  }

  async addCart() {
    try {
      await CartModel.create({ products: [] });
      const carts = await CartModel.find();
      const createdCart = carts[carts.length - 1];
      return createdCart;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getCartById(cartId) {
    try {
      const findedCart = await CartModel.find({ _id: cartId });
      if (findedCart.length < 1) {
        throw new Error(`No existe un carrito con ese id`);
      }
      return findedCart;
    } catch (err) {
      throw Error(err);
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      let findedCart = await this.getCartById(cartId);
      let findedProduct = await ProductModel.find({ _id: productId });
      if (findedCart.length < 1) {
        throw Error();
      }
      if (findedProduct.length < 1) {
        throw new Error("No existe ningún producto con ese Id");
      }
      let previousProduct = await CartModel.find({ "products.id": productId });
      if (previousProduct.length < 1) {
        await CartModel.updateOne(
          { _id: cartId },
          {
            $push: {
              products: { id: productId, quantity: 1 },
            },
          }
        );
      } else {
        await CartModel.updateOne(
          { _id: cartId, "products.id": productId },
          {
            $inc: {
              "products.$.quantity": 1,
            },
          }
        );
      }

      return { id: productId, quantity: 1 };
    } catch (err) {
      throw Error(err);
    }
  }

  async cleanCart(cartId) {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      await CartModel.updateOne({ _id: cartId }, { $set: { products: [] } });
      return await CartModel.find({ _id: cartId });
    } catch (err) {
      throw Error(err);
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      let products = findedCart[0].products;
      let findedProduct = products.find((p) => p.id === productId);
      if (!findedProduct) {
        throw new Error("No existe el producto buscado en este carrito");
      }
      await CartModel.findOneAndUpdate(
        { _id: cartId },
        { $pull: { products: { id: productId } } }
      );
    } catch (err) {
      throw Error(err);
    }
  }

  async updateProductsFromCart(cartId, data) {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      let formatedData;
      try {
        formatedData = data.map((p) => {
          if (!p.id || !p.quantity) {
            throw new Error(
              "Los datos a ingresar deben conservar la siguiente estructura: [{id: string, quantity: number}...]"
            );
          }
          return { id: p.id, quantity: p.quantity };
        });
      } catch (err) {
        throw new Error(
          "Los datos a ingresar deben conservar la siguiente estructura: [{id: string, quantity: number}...]"
        );
      }
      await CartModel.updateOne(
        { _id: cartId },
        { $set: { products: formatedData } }
      );
    } catch (err) {
      throw Error(err);
    }
  }

  async updateQuantityProductFromCart(cartId, productId, data) {
    try {
      let findedCart = await this.getCartById(cartId);
      if (!findedCart) {
        throw Error();
      }
      let products = findedCart[0].products;
      let findedProduct = products.find((p) => p.id === productId);
      if (!findedProduct) {
        throw new Error("No existe el producto buscado en este carrito");
      }
      if (!data.quantity || typeof data.quantity !== "number") {
        throw new Error(
          "Debe especificar la cantidad a modificar con el siguiente formato: {quantity: number}"
        );
      }
      const updated = await CartModel.findOneAndUpdate(
        { _id: cartId },
        { $set: { "products.$[elem].quantity": data.quantity } },
        { arrayFilters: [{ "elem.id": productId }], new: true }
      );
      return updated;
    } catch (err) {
      throw Error(err);
    }
  }
}

module.exports = CartManager;
