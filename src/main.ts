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
import { ensureElement, cloneTemplate } from "./utils/utils";

const events = new EventEmitter();
const productModel = new Product(events);
const cartModel = new Cart(events);
const customerModel = new Customer(events);

const page = new Page(ensureElement<HTMLElement>('.page'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basketView = new Basket(cloneTemplate<HTMLElement>('#basket'), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>('#order'), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>('#contacts'), events);
const successView = new Success(cloneTemplate<HTMLElement>('#success'), events);
const cardPreview = new CardPreview(cloneTemplate<HTMLElement>('#card-preview'), events);

const apiClient = new ApiClient(new Api(API_URL));

events.on<{ products: IProduct[] }>('products:changed', () => {
    const products = productModel.getProducts();
    const cards = products.map(product => {
        const card = new CardCatalog(cloneTemplate<HTMLElement>('#card-catalog'), events);
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

events.on('cart:changed', () => {
    page.counter = cartModel.getCount();

    // Обновляем содержимое корзины
    const items = cartModel.getItems();
    const basketCards = items.map((item, index) => {
        const card = new CardBasket(cloneTemplate<HTMLElement>('#card-basket'), events);

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

events.on('basket:open', () => {
    modal.content = basketView.render();
    modal.open();
});
events.on<{ id: string }>('card:select', (data) => {
    const product = productModel.getProductById(data.id);

    if (product) {
        productModel.setSelected(product);
    }
});

events.on<IProduct>('product:selected', (product) => {
    cardPreview.id = product.id;
    cardPreview.title = product.title;
    cardPreview.category = product.category;
    cardPreview.image = CDN_URL + product.image;
    cardPreview.description = product.description;
    cardPreview.price = product.price;
    if (cartModel.hasItem(product.id)) {
        cardPreview.buttonText = 'Удалить из корзины';
    } else {
        cardPreview.buttonText = 'В корзину';
    }
    if (product.price === null) {
        cardPreview.disableButton(true);
    } else {
        cardPreview.disableButton(false);
    }

    modal.content = cardPreview.render();
    modal.open();
});

events.on<{ id: string }>('card:toBasket', (data) => {
    const product = productModel.getProductById(data.id);

    if (product && product.price !== null) {
        if (cartModel.hasItem(product.id)) {
            cartModel.removeItem(product.id);
        } else {
            cartModel.addItem(product);
        }
        modal.close();
    }
});

events.on<{ id: string }>('basket:remove', (data) => {
    cartModel.removeItem(data.id);
});
events.on('basket:order', () => {
    orderForm.payment = null as any;
    orderForm.address = '';
    orderForm.valid = false;
    orderForm.errors = '';
    modal.content = orderForm.render();
});
events.on<{ payment: 'card' | 'cash' }>('order:payment', (data) => {
    customerModel.payment = data.payment;
});

events.on<{ field: string; value: string }>('order:input', (data) => {
    if (data.field === 'address') {
        customerModel.address = data.value;
    }
});
events.on('customer:changed', () => {
    const customerInfo = customerModel.getCustomerInfo();
    const errors = customerModel.validateCustomerInfo();

    // Валидация формы заказа (payment + address)
    const hasPaymentAndAddress = customerInfo.payment && customerInfo.address;
    orderForm.payment = customerInfo.payment;
    orderForm.valid = Boolean(hasPaymentAndAddress);
    orderForm.errors = errors.payment || errors.address || '';

    // Валидация формы контактов (email + phone)
    const hasEmailAndPhone = customerInfo.email && customerInfo.phone;
    contactsForm.valid = Boolean(hasEmailAndPhone);
    contactsForm.errors = errors.email || errors.phone || '';
});
events.on('order:submit', () => {
    const customerInfo = customerModel.getCustomerInfo();
    contactsForm.email = customerInfo.email || '';
    contactsForm.phone = customerInfo.phone || '';
    contactsForm.valid = false;
    contactsForm.errors = '';

    modal.content = contactsForm.render();
});

events.on<{ field: string; value: string }>('contacts:input', (data) => {
    if (data.field === 'email') {
        customerModel.email = data.value;
    }
    if (data.field === 'phone') {
        customerModel.phone = data.value;
    }
});
events.on('contacts:submit', () => {
    const customerInfo = customerModel.getCustomerInfo();
    const items = cartModel.getItems();
    const order: IOrderRequest = {
        payment: customerInfo.payment,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        total: cartModel.getTotal(),
        items: items.filter(item => item.price !== null).map(item => item.id)
    };
    apiClient.sendOrder(order)
        .then((result) => {
            console.log('Заказ успешно оформлен:', result);
            successView.total = cartModel.getTotal();
            modal.content = successView.render();
            cartModel.clear();
            customerModel.clearCustomerInfo();
        })
        .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error('Ошибка при оформлении заказа:', message);
            contactsForm.errors = 'Ошибка при оформлении заказа. Попробуйте еще раз.';
        });
});
events.on('success:close', () => {
    modal.close();
});

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});

apiClient.fetchProducts()
    .then((products) => {
        productModel.setProducts(products);
        console.log('Товары загружены с сервера:', products.length);
    })
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Ошибка загрузки товаров:', message);
    });