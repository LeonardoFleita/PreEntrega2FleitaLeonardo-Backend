const socket = io();

socket.on(`newProduct`, (product) => {
  const container = document.getElementById("productsContainer");
  container.innerHTML += `
     <div class="productCard" id="productCard${product.id}">
     <h3>${product.title}</h3>
     <img src=${product.thumbnail} alt=${product.title} />
     <p style="font-weight: 600">${product.description}</p>
     <p>Categoría: ${product.category}</p>
     <p>Precio: ${product.price}</p>
     <p>Código: ${product.code}</p>
     <p>Stock: ${product.stock}</p>
     <p>Id: ${product.id}</p>
     <form action="/realtimeproducts/delete" method="post">

     <button name="id" value="${product.id}" type="submit">Eliminar</button>
   </form>
   </div>`;
});

socket.on(`deleteProduct`, (id) => {
  const element = document.getElementById(`productCard${id}`);
  element.remove();
});
