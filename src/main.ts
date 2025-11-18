import { Api } from "./components/base/Api";
import { ApiClient } from "./components/base/ApiClient";
import { Cart } from "./components/models/card";
import { Customer } from "./components/models/customer";
import { Product } from "./components/models/product";
import "./scss/styles.scss";
import { IProduct } from "./types";
import { API_URL, CDN_URL, categoryMap } from "./utils/constants";
import { apiProducts } from "./utils/data";

// --- Каталог товаров ---
const catalogModel = new Product();
catalogModel.setProducts(apiProducts.items);
const galleryElement = document.querySelector<HTMLElement>(".gallery");
const cardTemplate =
  document.querySelector<HTMLTemplateElement>("#card-catalog");

const formatPrice = (price: number | null) =>
  price === null ? "Бесценно" : `${price} синапсов`;

const renderCatalog = (items: IProduct[]) => {
  if (!galleryElement || !cardTemplate) return;
  galleryElement.innerHTML = "";

  items.forEach((product) => {
    const fragment = cardTemplate.content.firstElementChild?.cloneNode(
      true
    ) as HTMLElement;
    if (!fragment) return;

    const categoryElement =
      fragment.querySelector<HTMLElement>(".card__category");
    const titleElement = fragment.querySelector<HTMLElement>(".card__title");
    const imageElement =
      fragment.querySelector<HTMLImageElement>(".card__image");
    const priceElement = fragment.querySelector<HTMLElement>(".card__price");

    if (categoryElement) {
      categoryElement.textContent = product.category;
      const modifier =
        categoryMap[product.category as keyof typeof categoryMap];
      categoryElement.className = `card__category ${modifier ?? ""}`.trim();
    }

    if (titleElement) titleElement.textContent = product.title;
    if (imageElement) {
      imageElement.src = `${CDN_URL}${product.image}`;
      imageElement.alt = product.title;
    }
    if (priceElement) priceElement.textContent = formatPrice(product.price);

    galleryElement.append(fragment);
  });
};

console.log("Массив товаров из каталога:", catalogModel.getProducts());
renderCatalog(catalogModel.getProducts());

// Выбор первого товара
const firstProduct = apiProducts.items[0];
if (firstProduct) {
  catalogModel.setSelected(firstProduct);
  console.log("Выбранный товар:", catalogModel.getSelected());
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

// --- Корзина ---
const cartModel = new Cart();
const [product1, product2] = apiProducts.items;

[product1, product2].forEach((p) => p && cartModel.addItem(p));

if (product1) cartModel.removeItem(product1.id);
console.log("После удаления:", cartModel.getItems());

cartModel.clear();
console.log("После очистки корзины:", cartModel.getCount());

// --- Валидация ---
console.log("Валидация данных:", customerModel.validateCustomerInfo());

customerModel.clearCustomerInfo();
console.log("После очистки данных:", customerModel.getCustomerInfo());

// --- Работа с сервером ---
const apiClient = new ApiClient(new Api(API_URL));

apiClient
  .fetchProducts()
  .then((products) => {
    catalogModel.setProducts(products);
    console.log("Каталог с сервера:", catalogModel.getProducts());
    renderCatalog(products);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ошибка API:", message);
  });
