import { Api } from "./components/base/Api";
import { ApiClient } from "./components/base/ApiClient";
import { Cart } from "./components/models/card";
import { Customer } from "./components/models/customer";
import { Product } from "./components/models/product";
import "./scss/styles.scss";
import { IProduct, TPayment } from "./types";
import { API_URL, CDN_URL, categoryMap } from "./utils/constants";
import { apiProducts } from "./utils/data";
import { cloneTemplate, ensureElement } from "./utils/utils";

// --- Модели данных ---
const catalogModel = new Product();
catalogModel.setProducts(apiProducts.items);
const cartModel = new Cart();
const customerModel = new Customer();
const apiClient = new ApiClient(new Api(API_URL));

// --- DOM-элементы ---
const galleryElement = ensureElement<HTMLElement>(".gallery");
const cardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const basketButton = ensureElement<HTMLButtonElement>(".header__basket");
const basketCounter = ensureElement<HTMLElement>(
  ".header__basket-counter",
  basketButton
);
const modalElement = ensureElement<HTMLDivElement>(".modal");
const modalContent = ensureElement<HTMLDivElement>(
  ".modal__content",
  modalElement
);
const modalCloseButton = ensureElement<HTMLButtonElement>(
  ".modal__close",
  modalElement
);

const formatPrice = (price: number | null) =>
  price === null ? "Бесценно" : `${price} синапсов`;

const updateCartCounter = () => {
  basketCounter.textContent = String(cartModel.getCount());
};

const closeModal = () => {
  modalElement.classList.remove("modal_active");
  modalContent.innerHTML = "";
};

const openModal = (content: HTMLElement) => {
  modalContent.innerHTML = "";
  modalContent.append(content);
  modalElement.classList.add("modal_active");
};

modalCloseButton.addEventListener("click", closeModal);
modalElement.addEventListener("click", (event) => {
  if (event.target === modalElement) {
    closeModal();
  }
});
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

const addProductToCart = (product: IProduct) => {
  if (product.price === null) {
    return;
  }
  cartModel.addItem(product);
  updateCartCounter();
  renderCatalog(catalogModel.getProducts());
};

const renderSuccessModal = (total: number) => {
  const successElement = cloneTemplate<HTMLDivElement>("#success");
  const description = successElement.querySelector<HTMLElement>(
    ".order-success__description"
  );
  if (description) {
    description.textContent = `Списано ${total} синапсов`;
  }
  const closeButton = successElement.querySelector<HTMLButtonElement>(
    ".order-success__close"
  );
  closeButton?.addEventListener("click", () => {
    closeModal();
  });
  openModal(successElement);
};

const renderBasketModal = () => {
  const basketElement = cloneTemplate<HTMLDivElement>("#basket");
  const listElement =
    basketElement.querySelector<HTMLUListElement>(".basket__list");
  const totalElement =
    basketElement.querySelector<HTMLElement>(".basket__price");
  const orderButton =
    basketElement.querySelector<HTMLButtonElement>(".basket__button");

  if (listElement) {
    listElement.innerHTML = "";
    const items = cartModel.getItems();
    if (items.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "basket__empty";
      emptyItem.textContent = "Корзина пуста";
      listElement.append(emptyItem);
    } else {
      items.forEach((product, index) => {
        const basketItem = cloneTemplate<HTMLLIElement>("#card-basket");
        const indexElement = basketItem.querySelector<HTMLElement>(
          ".basket__item-index"
        );
        const titleElement =
          basketItem.querySelector<HTMLElement>(".card__title");
        const priceElement =
          basketItem.querySelector<HTMLElement>(".card__price");
        const deleteButton = basketItem.querySelector<HTMLButtonElement>(
          ".basket__item-delete"
        );

        if (indexElement) {
          indexElement.textContent = String(index + 1);
        }
        if (titleElement) {
          titleElement.textContent = product.title;
        }
        if (priceElement) {
          priceElement.textContent = formatPrice(product.price);
        }
        deleteButton?.addEventListener("click", () => {
          cartModel.removeItem(product.id);
          updateCartCounter();
          renderCatalog(catalogModel.getProducts());
          renderBasketModal();
        });

        listElement.append(basketItem);
      });
    }
  }

  if (totalElement) {
    totalElement.textContent = `${cartModel.getTotal()} синапсов`;
  }
  if (orderButton) {
    orderButton.disabled = cartModel.getCount() === 0;
    orderButton.addEventListener("click", () => {
      openOrderForm();
    });
  }

  openModal(basketElement);
};

const submitOrder = async (
  errorsElement: HTMLElement | null,
  submitButton: HTMLButtonElement
) => {
  const validationErrors = customerModel.validateCustomerInfo();
  if (Object.keys(validationErrors).length > 0) {
    if (errorsElement) {
      errorsElement.textContent = Object.values(validationErrors).join("; ");
    }
    return;
  }

  const initialText = submitButton.textContent ?? "";
  submitButton.disabled = true;
  submitButton.textContent = "Отправляем...";

  try {
    const response = await apiClient.sendOrder({
      ...customerModel.getCustomerInfo(),
      items: cartModel.getItems().map((item) => item.id),
      total: cartModel.getTotal(),
    });
    cartModel.clear();
    customerModel.clearCustomerInfo();
    updateCartCounter();
    renderCatalog(catalogModel.getProducts());
    renderSuccessModal(response.total);
  } catch (error) {
    if (errorsElement) {
      const message = error instanceof Error ? error.message : String(error);
      errorsElement.textContent = message;
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = initialText;
  }
};

const openContactsForm = () => {
  const contactsForm = cloneTemplate<HTMLFormElement>("#contacts");
  const emailInput = contactsForm.elements.namedItem(
    "email"
  ) as HTMLInputElement;
  const phoneInput = contactsForm.elements.namedItem(
    "phone"
  ) as HTMLInputElement;
  const submitButton = contactsForm.querySelector<HTMLButtonElement>(
    'button[type="submit"]'
  );
  const errorsElement =
    contactsForm.querySelector<HTMLElement>(".form__errors");

  if (!submitButton) {
    return;
  }

  const updateState = () => {
    submitButton.disabled =
      !emailInput.value.trim().length || !phoneInput.value.trim().length;
  };

  contactsForm.addEventListener("input", updateState);
  contactsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    customerModel.email = emailInput.value.trim();
    customerModel.phone = phoneInput.value.trim();
    await submitOrder(errorsElement, submitButton);
  });

  updateState();
  openModal(contactsForm);
};

const openOrderForm = () => {
  const orderForm = cloneTemplate<HTMLFormElement>("#order");
  const addressInput = orderForm.elements.namedItem(
    "address"
  ) as HTMLInputElement;
  const paymentButtons = orderForm.querySelectorAll<HTMLButtonElement>(
    ".order__buttons .button"
  );
  const submitButton =
    orderForm.querySelector<HTMLButtonElement>(".order__button");

  if (!submitButton) {
    return;
  }

  let selectedPayment: TPayment | null = null;

  const updateState = () => {
    submitButton.disabled =
      !selectedPayment || !addressInput.value.trim().length;
  };

  paymentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedPayment = button.name as TPayment;
      paymentButtons.forEach((btn) =>
        btn.classList.toggle("button_alt-active", btn === button)
      );
      customerModel.payment = selectedPayment;
      updateState();
    });
  });

  orderForm.addEventListener("input", updateState);
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedPayment) {
      return;
    }
    customerModel.address = addressInput.value.trim();
    openContactsForm();
  });

  updateState();
  openModal(orderForm);
};

const openProductModal = (product: IProduct) => {
  const previewElement = cloneTemplate<HTMLDivElement>("#card-preview");
  const categoryElement =
    previewElement.querySelector<HTMLElement>(".card__category");
  const titleElement =
    previewElement.querySelector<HTMLElement>(".card__title");
  const descriptionElement =
    previewElement.querySelector<HTMLElement>(".card__text");
  const imageElement =
    previewElement.querySelector<HTMLImageElement>(".card__image");
  const priceElement =
    previewElement.querySelector<HTMLElement>(".card__price");
  const actionButton =
    previewElement.querySelector<HTMLButtonElement>(".card__button");

  if (categoryElement) {
    categoryElement.textContent = product.category;
    const modifier = categoryMap[product.category as keyof typeof categoryMap];
    categoryElement.className = `card__category ${modifier ?? ""}`.trim();
  }
  if (titleElement) {
    titleElement.textContent = product.title;
  }
  if (descriptionElement) {
    descriptionElement.textContent = product.description;
  }
  if (imageElement) {
    imageElement.src = `${CDN_URL}${product.image}`;
    imageElement.alt = product.title;
  }
  if (priceElement) {
    priceElement.textContent = formatPrice(product.price);
  }
  if (actionButton) {
    const inCart = cartModel.hasItem(product.id);
    const isAvailable = product.price !== null;
    actionButton.textContent = isAvailable
      ? inCart
        ? "В корзине"
        : "В корзину"
      : "Недоступно";
    actionButton.disabled = !isAvailable;
    actionButton.addEventListener("click", () => {
      if (!isAvailable) {
        return;
      }
      if (!inCart) {
        addProductToCart(product);
      }
      renderBasketModal();
    });
  }

  openModal(previewElement);
};

const renderCatalog = (items: IProduct[]) => {
  galleryElement.innerHTML = "";

  items.forEach((product) => {
    const fragment = cardTemplate.content.firstElementChild?.cloneNode(
      true
    ) as HTMLElement;
    if (!fragment) {
      return;
    }

    const categoryElement =
      fragment.querySelector<HTMLElement>(".card__category");
    const titleElement = fragment.querySelector<HTMLElement>(".card__title");
    const imageElement =
      fragment.querySelector<HTMLImageElement>(".card__image");
    const priceElement = fragment.querySelector<HTMLElement>(".card__price");
    const actionButton =
      fragment.querySelector<HTMLButtonElement>(".card__button");

    if (categoryElement) {
      categoryElement.textContent = product.category;
      const modifier =
        categoryMap[product.category as keyof typeof categoryMap];
      categoryElement.className = `card__category ${modifier ?? ""}`.trim();
    }
    if (titleElement) {
      titleElement.textContent = product.title;
    }
    if (imageElement) {
      imageElement.src = `${CDN_URL}${product.image}`;
      imageElement.alt = product.title;
    }
    if (priceElement) {
      priceElement.textContent = formatPrice(product.price);
    }
    if (actionButton) {
      const inCart = cartModel.hasItem(product.id);
      const isAvailable = product.price !== null;
      actionButton.textContent = isAvailable
        ? inCart
          ? "В корзине"
          : "Купить"
        : "Недоступно";
      actionButton.disabled = !isAvailable;
      actionButton.classList.toggle("button_alt-active", inCart);
      actionButton.classList.toggle("card__button_disabled", !isAvailable);
      actionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!isAvailable) {
          return;
        }
        if (!inCart) {
          addProductToCart(product);
        }
        renderBasketModal();
      });
    }

    fragment.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest(".card__button")) {
        return;
      }
      openProductModal(product);
    });

    galleryElement.append(fragment);
  });
};

// --- Инициализация ---
updateCartCounter();
renderCatalog(catalogModel.getProducts());

basketButton.addEventListener("click", () => {
  renderBasketModal();
});

apiClient
  .fetchProducts()
  .then((products) => {
    catalogModel.setProducts(products);
    renderCatalog(products);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Ошибка API:", message);
  });
