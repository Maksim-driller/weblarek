import './scss/styles.scss';
import { EventEmitter } from "./components/base/Events";
import { Api } from "./components/base/Api";
import { ApiClient } from "./components/base/ApiClient";
import { Cart } from "./components/models/cart";
import { Customer } from "./components/models/customer";
import { Product } from "./components/models/product";
import { API_URL, CDN_URL } from "./utils/constants";
import { IProduct, IOrderRequest } from "./types";
import { Page } from "./components/view/Page";
import { Modal } from "./components/view/Modal";
import { CardCatalog } from "./components/view/CardCatalog";
import { CardPreview } from "./components/view/CardPreview";
import { CardBasket } from "./components/view/CardBasket";
import { Basket } from "./components/view/Basket";
import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactsForm";
import { Success } from "./components/view/Success";

// Создаем брокер событий
const events = new EventEmitter();

// --- ИНИЦИАЛИЗАЦИЯ МОДЕЛЕЙ ---
const productModel = new Product(events);
const cartModel = new Cart(events);
const customerModel = new Customer(events);

// --- ИНИЦИАЛИЗАЦИЯ VIEW ---

// Главная страница
const pageContainer = document.querySelector('.page') as HTMLElement;
const page = new Page(pageContainer, events);

// Модальное окно
const modalContainer = document.querySelector('#modal-container') as HTMLElement;
const modal = new Modal(modalContainer, events);

// Темплейты для клонирования
const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

// Создаем View для корзины
const basketView = new Basket(basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, events);

// Создаем View для форм
const orderForm = new OrderForm(orderTemplate.content.firstElementChild!.cloneNode(true) as HTMLFormElement, events);
const contactsForm = new ContactsForm(contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLFormElement, events);

// Создаем View для экрана успеха
const successView = new Success(successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, events);

// --- API CLIENT ---
const apiClient = new ApiClient(new Api(API_URL));

// =============================================================================
// PRESENTER LOGIC - Обработка событий
// =============================================================================

// --- СОБЫТИЯ ОТ МОДЕЛЕЙ ---

// Когда загрузились товары из API
events.on<{ products: IProduct[] }>('products:changed', () => {
    const products = productModel.getProducts();

    // Создаем карточки для галереи
    const cards = products.map(product => {
        const cardElement = cardCatalogTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new CardCatalog(cardElement, events);

        // Устанавливаем данные карточки
        card.id = product.id;
        card.title = product.title;
        card.category = product.category;
        card.image = CDN_URL + product.image;
        card.price = product.price;

        // Если товар бесценный или уже в корзине - блокируем кнопку
        if (product.price === null || cartModel.hasItem(product.id)) {
            card.disableButton(true);
        }

        return card.render();
    });

    // Отображаем карточки в галерее
    page.catalog = cards;
});

// Когда изменилась корзина
events.on('cart:changed', () => {
    // Обновляем счетчик в шапке
    page.counter = cartModel.getCount();

    // Обновляем карточки в галерее (блокируем кнопки для товаров в корзине)
    const products = productModel.getProducts();
    const cards = products.map(product => {
        const cardElement = cardCatalogTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new CardCatalog(cardElement, events);

        card.id = product.id;
        card.title = product.title;
        card.category = product.category;
        card.image = CDN_URL + product.image;
        card.price = product.price;

        if (product.price === null || cartModel.hasItem(product.id)) {
            card.disableButton(true);
        }

        return card.render();
    });

    page.catalog = cards;
});

// --- СОБЫТИЯ ОТ PAGE ---

// Клик на кнопку корзины
events.on('basket:open', () => {
    const items = cartModel.getItems();

    // Создаем карточки для корзины
    const basketCards = items.map((item, index) => {
        const cardElement = cardBasketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new CardBasket(cardElement, events);

        card.id = item.id;
        card.index = index + 1;
        card.title = item.title;
        card.price = item.price;

        return card.render();
    });

    // Обновляем корзину
    basketView.items = basketCards;
    basketView.total = cartModel.getTotal();
    basketView.disableButton(cartModel.getCount() === 0);

    // Открываем модальное окно с корзиной
    modal.content = basketView.render();
    modal.open();
});

// --- СОБЫТИЯ ОТ КАРТОЧЕК В ГАЛЕРЕЕ ---

// Клик на карточку в галерее - показать детальный просмотр
events.on<{ id: string }>('card:select', (data) => {
    const product = productModel.getProductById(data.id);

    if (product) {
        productModel.setSelected(product);

        // Создаем превью карточку
        const cardElement = cardPreviewTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const cardPreview = new CardPreview(cardElement, events);

        cardPreview.id = product.id;
        cardPreview.title = product.title;
        cardPreview.category = product.category;
        cardPreview.image = CDN_URL + product.image;
        cardPreview.description = product.description;
        cardPreview.price = product.price;

        // Меняем текст и состояние кнопки в зависимости от наличия в корзине
        if (cartModel.hasItem(product.id)) {
            cardPreview.buttonText = 'Удалить из корзины';
        } else {
            cardPreview.buttonText = 'В корзину';
        }

        // Блокируем кнопку если товар бесценный
        if (product.price === null) {
            cardPreview.disableButton(true);
        }

        modal.content = cardPreview.render();
        modal.open();
    }
});

// Клик на кнопку "Купить" в карточке галереи
events.on<{ id: string }>('card:add', (data) => {
    const product = productModel.getProductById(data.id);

    if (product && product.price !== null) {
        cartModel.addItem(product);
    }
});

// --- СОБЫТИЯ ОТ ПРЕВЬЮ КАРТОЧКИ ---

// Клик на кнопку в превью карточке (добавить/удалить из корзины)
events.on<{ id: string }>('card:toBasket', (data) => {
    const product = productModel.getProductById(data.id);

    if (product && product.price !== null) {
        if (cartModel.hasItem(product.id)) {
            // Удаляем из корзины
            cartModel.removeItem(product.id);
        } else {
            // Добавляем в корзину
            cartModel.addItem(product);
        }

        // Закрываем модальное окно
        modal.close();
    }
});

// --- СОБЫТИЯ ОТ КОРЗИНЫ ---

// Клик на кнопку удаления товара из корзины
events.on<{ id: string }>('basket:remove', (data) => {
    cartModel.removeItem(data.id);

    // Обновляем корзину
    const items = cartModel.getItems();
    const basketCards = items.map((item, index) => {
        const cardElement = cardBasketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new CardBasket(cardElement, events);

        card.id = item.id;
        card.index = index + 1;
        card.title = item.title;
        card.price = item.price;

        return card.render();
    });

    basketView.items = basketCards;
    basketView.total = cartModel.getTotal();
    basketView.disableButton(cartModel.getCount() === 0);
});

// Клик на кнопку "Оформить" в корзине
events.on('basket:order', () => {
    // Очищаем форму
    orderForm.payment = null as any;
    orderForm.address = '';
    orderForm.valid = false;
    orderForm.errors = '';

    // Открываем форму заказа
    modal.content = orderForm.render();
});

// --- СОБЫТИЯ ОТ ФОРМЫ ЗАКАЗА ---

// Выбор способа оплаты
events.on<{ payment: 'card' | 'cash' }>('order:payment', (data) => {
    customerModel.payment = data.payment;
    orderForm.payment = data.payment;
});

// Изменение полей формы заказа
events.on<{ field: string; value: string }>('order:input', (data) => {
    if (data.field === 'address') {
        customerModel.address = data.value;
    }

    // Валидация
    const errors = customerModel.validateCustomerInfo();
    const hasPaymentAndAddress = customerModel.getCustomerInfo().payment && customerModel.getCustomerInfo().address;

    orderForm.valid = Boolean(hasPaymentAndAddress);
    orderForm.errors = errors.payment || errors.address || '';
});

// Отправка формы заказа
events.on('order:submit', () => {
    // Переходим к форме контактов
    contactsForm.email = customerModel.getCustomerInfo().email || '';
    contactsForm.phone = customerModel.getCustomerInfo().phone || '';
    contactsForm.valid = false;
    contactsForm.errors = '';

    modal.content = contactsForm.render();
});

// --- СОБЫТИЯ ОТ ФОРМЫ КОНТАКТОВ ---

// Изменение полей формы контактов
events.on<{ field: string; value: string }>('contacts:input', (data) => {
    if (data.field === 'email') {
        customerModel.email = data.value;
    }
    if (data.field === 'phone') {
        customerModel.phone = data.value;
    }

    // Валидация
    const errors = customerModel.validateCustomerInfo();
    const hasEmailAndPhone = customerModel.getCustomerInfo().email && customerModel.getCustomerInfo().phone;

    contactsForm.valid = Boolean(hasEmailAndPhone);
    contactsForm.errors = errors.email || errors.phone || '';
});

// Отправка формы контактов (финальная отправка заказа)
events.on('contacts:submit', () => {
    const customerInfo = customerModel.getCustomerInfo();
    const items = cartModel.getItems();

    // Формируем заказ
    const order: IOrderRequest = {
        payment: customerInfo.payment,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        total: cartModel.getTotal(),
        items: items.filter(item => item.price !== null).map(item => item.id)
    };

    // Отправляем заказ на сервер
    apiClient.sendOrder(order)
        .then((result) => {
            console.log('Заказ успешно оформлен:', result);

            // Показываем экран успеха
            successView.total = cartModel.getTotal();
            modal.content = successView.render();

            // Очищаем корзину и данные покупателя
            cartModel.clear();
            customerModel.clearCustomerInfo();
        })
        .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Ошибка при оформлении заказа:', message);
            contactsForm.errors = 'Ошибка при оформлении заказа. Попробуйте еще раз.';
        });
});

// --- СОБЫТИЯ ОТ ЭКРАНА УСПЕХА ---

// Клик на кнопку "За новыми покупками!"
events.on('success:close', () => {
    modal.close();
});

// --- СОБЫТИЯ ОТ МОДАЛЬНОГО ОКНА ---

// При открытии модального окна - блокируем прокрутку страницы
events.on('modal:open', () => {
    page.locked = true;
});

// При закрытии модального окна - разблокируем прокрутку
events.on('modal:close', () => {
    page.locked = false;
});

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// =============================================================================

// Загружаем товары с сервера
apiClient.fetchProducts()
    .then((products) => {
        productModel.setProducts(products);
        console.log('Товары загружены с сервера:', products.length);
    })
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Ошибка загрузки товаров:', message);
    });
