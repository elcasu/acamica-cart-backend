# Carrito de compras - Backend

## Introducción

Implementación del backend para el desafío del carrito de compras de Acámica.
La idea es exponer algunos endpoints que nos permitan:

- Loguearse en la aplicación con email / password
- Utilizando el usuario actualmente logueado:
  - Obtener el listado de productos
  - Obtener el carrito en su estado actual
  - Agregar productos al carrito
  - Eliminar un producto del carrito
  - Obtener la whishlist en su estado actual
  - Agregar un producto a la whishlist
  - Eliminar un producto de la whishlist

## Endpoints

Estos son los endpoints disponibles:

## Autenticación
```
  POST /api/users/authenticate
```

y en el body del request enviamos los siguientes datos:

```json
{
  "email": "usuario@example.com",
  "password": "mi-password"
}
```

Si las credenciales son correctas, el endpoint retornará la siguiente información del usuario:

```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YjkzYzA4YWNmNTk4OWVjYTQ1OGM3MTQiLCJlbWFpbCI6InBlcGVAZXhhbXBsZS5jb20iLCJpYXQiOjE1MzY1MjQ4NzAsImV4cCI6MTUzNjYxMTI3MH0.wZnCqFP_qMYZR-4F8hpU6H15nZMWwjjMnh_iuJI4JhI",
    "user": {
        "_id": "5b93c08acf5989eca458c714",
        "email": "usuario@example.com",
        "firstname": "Pepe",
        "lastname": "Argento"
    }
}
```

En caso de que las credenciales sean inválidas, devuelve un 401 con el siguiente detalle:
```json
{
    "code": 1000100,
    "message": "Invalid credentials.",
    "detail": {},
    "errors": []
}
```

## Productos

### Obtener listado de productos
```
  GET /api/products
```

La cual devolverá un listado de los productos disponibles:
```json
[
    {
        "_id": "5b9596046b0838f64c0c5012",
        "name": "Macbook Pro",
        "price": 30000,
        "oldPrice": 35000,
        "pictureUrl": "https://s3.amazonaws.com/acamica-cart-images/product01.png"
    },
    {
        "_id": "5b9596046b0838f64c0c5013",
        "name": "Auriculares Sony",
        "price": 2500,
        "oldPrice": 2650,
        "pictureUrl": "https://s3.amazonaws.com/acamica-cart-images/product02.png"
    },
    ...
]
```

## Carrito

### Obtener carrito
```
  GET /api/cart
```

El cual devuelve la siguiente información:

```json
[
    {
        "qty": 2,
        "product": {
            "pictureUrl": "https://s3.amazonaws.com/acamica-cart-images/product01.png",
            "oldPrice": 35000,
            "price": 30000,
            "name": "Macbook Pro",
            "__v": 0,
            "_id": "5b9596046b0838f64c0c5012"
        },
        "_id": "5b959820c630e5f69601284e"
    },
    {
        "qty": 1,
        "product": {
            "pictureUrl": "https://s3.amazonaws.com/acamica-cart-images/product02.png",
            "oldPrice": 2650,
            "price": 2500,
            "name": "Auriculares Sony",
            "__v": 0,
            "_id": "5b9596046b0838f64c0c5013"
        },
        "_id": "5b95983fc630e5f696012851"
    }
]
```

### Agregar productos al carrito
```
  POST /api/cart
```
Con el body:

```json
{
	"productId": "5b9596046b0838f64c0c5013",
	"qty": 1
}
```

Si se vuelve a agregar el mismo producto luego, se sumará la cantidad actual con la anterior y se actualizará el registro existente
en lugar de crear uno nuevo.

Si el producto no existe (el ID no matchea con ningún registro), se devuelve un 400 (bad request)

### Eliminar un producto del carrito

```json
  DELETE /api/cart/:productId
```

Donde `:productId` es el ID del producto que se desea eliminar del carrito.
Esto restará en 1 la cantidad de productos en el carrito.

Si se quiere eliminar un producto del carrito aunque su cantidad sea mayor a 1, podemos agregar el parámetro opcional `all`
```json
  DELETE /api/cart/:productId?all=1
```

## Whishlist

### Obntener whishlist
```
  GET /api/whishlist
```

El cual devuelve el siguiente listado:
```json
[
    {
        "__v": 0,
        "name": "Tablet Xperia",
        "price": 5400,
        "oldPrice": 6000,
        "pictureUrl": "https://s3.amazonaws.com/acamica-cart-images/product04.png",
        "_id": "5b9596046b0838f64c0c5014"
    }
]
```

### Agregar un producto a la whishlist
```
  POST /api/whishlist
```

Pasándole el producto en el body

```json
{
	"productId": "5b9596046b0838f64c0c5014"
}
```

Si la operación fué exitosa, se devuelve el listado actualizado de productos en la whishlist.

Si el producto ya existía, devuelve un 409 con el respectivo mensaje de error.

Si el producto no existe (el ID no matchea con ningún registro), se devuelve un 400 (bad request)

### Remover un producto de la whishlist
```
  DELETE /api/whishlist/:productId
```

Donde `:productId` es el ID del producto que se desea quitar de la whishlist.

El endpoint devuelve la whishlist actualizada luego de la operación.

