const ORDER_ENDPOINT = "";

const products = [
  {id:"tnano-1l-trong", name:"TNANO 1L TRONG", fullName:"Sơn Chống Thấm TNANO 1L TRONG", price:195000, volume:"1L", variant:"TRONG", image:"./design/T3.jpg"},
  {id:"tnano-1l-pu", name:"TNANO 1L PU", fullName:"Sơn Chống Thấm TNANO 1L PU", price:205000, volume:"1L", variant:"PU", image:"./design/A2.jpg"},
  {id:"tnano-5l-trong", name:"TNANO 5L TRONG", fullName:"Sơn Chống Thấm TNANO 5L TRONG", price:670000, volume:"5L", variant:"TRONG", image:"./design/A1.jpg"},
  {id:"tnano-5l-pu", name:"TNANO 5L PU", fullName:"Sơn Chống Thấm TNANO 5L PU", price:723000, volume:"5L", variant:"PU", image:"./design/A3.jpg"},
  {id:"tnano-18l-trong", name:"TNANO 18L TRONG", fullName:"Sơn Chống Thấm TNANO 18L TRONG", price:2236000, volume:"18L", variant:"TRONG", image:"./design/A4.jpg"},
  {id:"tnano-18l-pu", name:"TNANO 18L PU", fullName:"Sơn Chống Thấm TNANO 18L PU", price:2300000, volume:"18L", variant:"PU", image:"./design/1787122930851_5062789529714247547_5062789529714247547_21a805e3d03f90b6d81da014fe5d1847.jpg"}
];

const state = {
  selectedProductId: "",
  quantity: 1
};

const money = new Intl.NumberFormat("vi-VN");
const formatMoney = value => `${money.format(value)}đ`;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const productList = $("#productList");
const orderOptions = $("#orderProductOptions");
const orderForm = $(".order-form");
const successState = $(".success-state");
const quantityValue = $("#quantityValue");
const summaryProduct = $("#summaryProduct");
const summaryQuantity = $("#summaryQuantity");
const summaryPrice = $("#summaryPrice");
const summarySubtotal = $("#summarySubtotal");
const summaryTotal = $("#summaryTotal");
const menuToggle = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");

function trackEvent(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event:eventName, ...payload});

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }

  if (typeof window.fbq === "function") {
    const metaName = eventName === "purchase_or_lead_submit" ? "Lead" : eventName;
    window.fbq("trackCustom", metaName, payload);
  }
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    gclid: params.get("gclid") || "",
    fbclid: params.get("fbclid") || ""
  };
}

function getSelectedProduct() {
  return products.find(product => product.id === state.selectedProductId) || null;
}

function scrollToOrder() {
  trackEvent("click_buy");
  $("#order").scrollIntoView({behavior:"smooth", block:"start"});
}

function renderProductCards() {
  productList.innerHTML = products.map(product => `
    <article class="product-card" data-product-card="${product.id}">
      <img loading="lazy" src="${product.image}" alt="${product.fullName}">
      <div>
        <h3>${product.fullName}</h3>
        <p class="product-meta">${product.volume} · ${product.variant}</p>
        <p class="product-price">${formatMoney(product.price)}</p>
        <button class="btn btn-primary" type="button" data-buy-product="${product.id}">Mua ngay</button>
      </div>
    </article>
  `).join("");

  orderOptions.innerHTML = products.map(product => `
    <label class="option-card" data-option-card="${product.id}">
      <input type="radio" name="productId" value="${product.id}">
      <img loading="lazy" src="${product.image}" alt="${product.fullName}">
      <span>
        <strong>${product.fullName}</strong>
        <span>${product.volume} · ${product.variant}</span>
        <b>${formatMoney(product.price)}</b>
      </span>
      <i class="option-check" aria-hidden="true">✓</i>
    </label>
  `).join("");
}

function selectProduct(productId, shouldScroll = false) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  state.selectedProductId = productId;
  $$("input[name='productId']").forEach(input => {
    input.checked = input.value === productId;
  });
  $$(".option-card").forEach(card => {
    const selected = card.dataset.optionCard === productId;
    card.classList.toggle("selected", selected);
    card.classList.remove("highlight-pulse");
    if (selected) {
      requestAnimationFrame(() => card.classList.add("highlight-pulse"));
    }
  });

  clearError("productId");
  updateSummary();
  trackEvent("select_product", {
    product_id: product.id,
    product_name: product.fullName,
    value: product.price,
    currency: "VND"
  });

  if (shouldScroll) {
    scrollToOrder();
    setTimeout(() => {
      const selectedCard = $(`[data-option-card="${productId}"]`);
      selectedCard?.scrollIntoView({behavior:"smooth", block:"center"});
    }, 380);
  }
}

function updateQuantity(nextQuantity) {
  state.quantity = Math.max(1, Number(nextQuantity) || 1);
  quantityValue.textContent = String(state.quantity);
  clearError("quantity");
  updateSummary();
}

function updateSummary() {
  const product = getSelectedProduct();
  const total = product ? product.price * state.quantity : 0;

  summaryProduct.textContent = product ? product.name : "Chưa chọn";
  summaryQuantity.textContent = String(state.quantity);
  summaryPrice.textContent = product ? formatMoney(product.price) : "0đ";
  summarySubtotal.textContent = formatMoney(total);
  summaryTotal.textContent = formatMoney(total);
}

function setError(name, message) {
  const error = $(`[data-error-for="${name}"]`);
  error.textContent = message;

  const field = error.closest(".field");
  if (field) field.classList.add("invalid");
}

function clearError(name) {
  const error = $(`[data-error-for="${name}"]`);
  if (!error) return;
  error.textContent = "";

  const field = error.closest(".field");
  if (field) field.classList.remove("invalid");
}

function clearErrors() {
  ["fullName","phone","address","productId","quantity"].forEach(clearError);
  $(".form-message").textContent = "";
}

function isValidPhone(phone) {
  return /^(0|\+84)(\d{8,10})$/.test(phone.replace(/\s|\.|-/g, ""));
}

function validateForm(formData) {
  clearErrors();
  const errors = [];
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();

  if (!fullName) errors.push(["fullName", "Vui lòng nhập họ và tên."]);
  if (!phone) {
    errors.push(["phone", "Vui lòng nhập số điện thoại."]);
  } else if (!isValidPhone(phone)) {
    errors.push(["phone", "Số điện thoại chưa hợp lệ."]);
  }
  if (!address) errors.push(["address", "Vui lòng nhập địa chỉ nhận hàng."]);
  if (!getSelectedProduct()) errors.push(["productId", "Vui lòng chọn sản phẩm."]);
  if (state.quantity < 1) errors.push(["quantity", "Số lượng phải từ 1 trở lên."]);

  errors.forEach(([name, message]) => setError(name, message));
  return errors;
}

function scrollToFirstError(errors) {
  const [firstName] = errors[0] || [];
  if (!firstName) return;
  const error = $(`[data-error-for="${firstName}"]`);
  const target = error.closest(".field,.product-options,.quantity-panel") || error;
  target.scrollIntoView({behavior:"smooth", block:"center"});
}

function buildOrderPayload(formData) {
  const product = getSelectedProduct();
  const total = product.price * state.quantity;

  return {
    timestamp: new Date().toISOString(),
    fullName: String(formData.get("fullName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    productId: product.id,
    productName: product.fullName,
    variant: product.variant,
    price: product.price,
    quantity: state.quantity,
    total,
    pageUrl: window.location.href,
    ...getUrlParams()
  };
}

async function submitOrder(payload) {
  if (!ORDER_ENDPOINT) {
    await new Promise(resolve => setTimeout(resolve, 450));
    return {demo:true};
  }

  await fetch(ORDER_ENDPOINT, {
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(payload)
  });
  return {sent:true};
}

function showSuccess(payload) {
  orderForm.hidden = true;
  successState.hidden = false;
  successState.querySelector(".success-summary").innerHTML = `
    <div><span>Tên khách:</span><strong>${payload.fullName}</strong></div>
    <div><span>Sản phẩm:</span><strong>${payload.productName}</strong></div>
    <div><span>Số lượng:</span><strong>${payload.quantity}</strong></div>
    <div><span>Tổng tiền:</span><strong>${formatMoney(payload.total)}</strong></div>
  `;
  successState.scrollIntoView({behavior:"smooth", block:"center"});
}

function bindEvents() {
  menuToggle.addEventListener("click", () => {
    const open = !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });

  mobileMenu.addEventListener("click", event => {
    if (!event.target.closest("a")) return;
    mobileMenu.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  });

  productList.addEventListener("click", event => {
    const button = event.target.closest("[data-buy-product]");
    if (!button) return;
    const productId = button.dataset.buyProduct;
    const product = products.find(item => item.id === productId);
    trackEvent("view_product", {product_id: product.id, product_name: product.fullName});
    trackEvent("begin_checkout", {product_id: product.id, product_name: product.fullName, value: product.price, currency:"VND"});
    selectProduct(productId, true);
  });

  orderOptions.addEventListener("change", event => {
    const input = event.target.closest("input[name='productId']");
    if (input) selectProduct(input.value);
  });

  orderOptions.addEventListener("click", event => {
    const card = event.target.closest(".option-card");
    if (card) selectProduct(card.dataset.optionCard);
  });

  $$(".js-buy").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      trackEvent("begin_checkout", {});
      scrollToOrder();
    });
  });

  $$("[data-track='click_call']").forEach(link => {
    link.addEventListener("click", () => trackEvent("click_call"));
  });

  $$(".qty-btn").forEach(button => {
    button.addEventListener("click", () => {
      const direction = button.dataset.qty === "plus" ? 1 : -1;
      updateQuantity(state.quantity + direction);
    });
  });

  $$(".faq-item").forEach(item => {
    item.addEventListener("click", () => item.classList.toggle("active"));
  });

  orderForm.addEventListener("input", event => {
    const name = event.target.name;
    if (name) clearError(name);
  });

  orderForm.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(orderForm);
    const errors = validateForm(formData);
    if (errors.length) {
      scrollToFirstError(errors);
      return;
    }

    const submitButton = orderForm.querySelector(".order-submit");
    const payload = buildOrderPayload(formData);
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;

    try {
      await submitOrder(payload);
      trackEvent("purchase_or_lead_submit", {
        product_id: payload.productId,
        product_name: payload.productName,
        value: payload.total,
        currency: "VND",
        quantity: payload.quantity
      });
      showSuccess(payload);
    } catch (error) {
      $(".form-message").textContent = "Chưa gửi được đơn hàng. Vui lòng thử lại hoặc gọi hotline TNANO.";
    } finally {
      submitButton.classList.remove("is-loading");
      submitButton.disabled = false;
    }
  });

  $("#continueShopping").addEventListener("click", () => {
    successState.hidden = true;
    orderForm.hidden = false;
    $("#products").scrollIntoView({behavior:"smooth", block:"start"});
  });
}

renderProductCards();
bindEvents();
updateSummary();
