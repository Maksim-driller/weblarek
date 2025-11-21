import { Api } from "./components/base/Api";
import { ApiClient } from "./components/base/ApiClient";
import { Cart } from "./components/models/cart";
import { Customer } from "./components/models/customer";
import { Product } from "./components/models/product";
import { API_URL } from "./utils/constants";
import { apiProducts } from "./utils/data";

// --- Каталог товаров ---
const catalogModel = new Product();
catalogModel.setProducts(apiProducts.items);

console.log("Массив товаров из каталога:", catalogModel.getProducts());

// Выбор первого товара
const firstProduct = apiProducts.items[0];
if (firstProduct) {
  catalogModel.setSelected(firstProduct);
  console.log("Выбранный товар:", catalogModel.getSelected());
}

// Поиск товара по ID
if (firstProduct) {
  const foundProduct = catalogModel.getProductById(firstProduct.id);
  console.log("Товар найден по ID:", foundProduct);
}

// --- Покупатель ---
const customerModel = new Customer();

customerModel.setCustomerInfo({
  payment: "card",
  address: "Spb Vosstania 1",
  phone: "+71234567890",
  email: "test@test.ru",
});

console.log("Информация о покупателе:", customerModel.getCustomerInfo());

// Установка отдельных полей
customerModel.payment = "cash";
customerModel.address = "Moscow, Red Square 1";
customerModel.email = "newemail@test.ru";
customerModel.phone = "+79876543210";

console.log(
  "Информация о покупателе после изменения:",
  customerModel.getCustomerInfo()
);

// Валидация данных
console.log("Валидация данных:", customerModel.validateCustomerInfo());

// Очистка данных
customerModel.clearCustomerInfo();
console.log("После очистки данных:", customerModel.getCustomerInfo());
console.log("Валидация после очистки:", customerModel.validateCustomerInfo());

// --- Корзина ---
const cartModel = new Cart();
const [product1, product2, product3] = apiProducts.items;

// Добавление товаров
if (product1) {
  cartModel.addItem(product1);
  console.log("Добавлен товар 1. Товаров в корзине:", cartModel.getCount());
}

if (product2) {
  cartModel.addItem(product2);
  console.log("Добавлен товар 2. Товаров в корзине:", cartModel.getCount());
}

// Попытка добавить товар повторно
if (product1) {
  cartModel.addItem(product1);
  console.log(
    "Попытка добавить товар 1 повторно. Товаров в корзине:",
    cartModel.getCount()
  );
}

console.log("Все товары в корзине:", cartModel.getItems());
console.log("Общая сумма корзины:", cartModel.getTotal());

// Проверка наличия товара
if (product1) {
  console.log("Товар 1 в корзине:", cartModel.hasItem(product1.id));
}

if (product3) {
  console.log("Товар 3 в корзине:", cartModel.hasItem(product3.id));
}

// Удаление товара
if (product1) {
  cartModel.removeItem(product1.id);
  console.log(
    "После удаления товара 1. Товаров в корзине:",
    cartModel.getCount()
  );
  console.log("Товары в корзине:", cartModel.getItems());
  console.log("Общая сумма после удаления:", cartModel.getTotal());
}

// Очистка корзины
cartModel.clear();
console.log("После очистки корзины. Товаров в корзине:", cartModel.getCount());
console.log("Товары в корзине:", cartModel.getItems());
console.log("Общая сумма после очистки:", cartModel.getTotal());

// --- Работа с сервером ---
const apiClient = new ApiClient(new Api(API_URL));

apiClient
  .fetchProducts()
  .then((products) => {
    catalogModel.setProducts(products);
    console.log("Каталог с сервера:", catalogModel.getProducts());
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ошибка API:", message);
  });
