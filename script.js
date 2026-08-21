const ORDER_ENDPOINT = "";
const OFFICE_PHONE = "0237 358 6999";
const OFFICE_PHONE_TEL = "02373586999";
const PRODUCT_IMAGES = {
  transparent: "./design/web/sơn trong suốt.jpg",
  gray: "./design/web/sơn màu ghi.jpg"
};

const products = [
  {id:"tnano-1l-trong", name:"TNANO 1L TRONG", fullName:"Sơn Chống Thấm TNANO 1L TRONG", price:195000, volume:"1L", variant:"TRONG", color:"transparent", image:PRODUCT_IMAGES.transparent},
  {id:"tnano-1l-ghi", name:"TNANO 1L MÀU GHI", fullName:"Sơn Chống Thấm TNANO 1L MÀU GHI", price:205000, volume:"1L", variant:"MÀU GHI", color:"gray", image:PRODUCT_IMAGES.gray},
  {id:"tnano-5l-trong", name:"TNANO 5L TRONG", fullName:"Sơn Chống Thấm TNANO 5L TRONG", price:670000, volume:"5L", variant:"TRONG", color:"transparent", image:PRODUCT_IMAGES.transparent},
  {id:"tnano-5l-ghi", name:"TNANO 5L MÀU GHI", fullName:"Sơn Chống Thấm TNANO 5L MÀU GHI", price:723000, volume:"5L", variant:"MÀU GHI", color:"gray", image:PRODUCT_IMAGES.gray},
  {id:"tnano-18l-trong", name:"TNANO 18L TRONG", fullName:"Sơn Chống Thấm TNANO 18L TRONG", price:2236000, volume:"18L", variant:"TRONG", color:"transparent", image:PRODUCT_IMAGES.transparent},
  {id:"tnano-18l-ghi", name:"TNANO 18L MÀU GHI", fullName:"Sơn Chống Thấm TNANO 18L MÀU GHI", price:2300000, volume:"18L", variant:"MÀU GHI", color:"gray", image:PRODUCT_IMAGES.gray}
];

const colors = [
  {id:"transparent", label:"TRONG SUỐT", line:"Màu: Trong suốt"},
  {id:"gray", label:"MÀU GHI", line:"Màu: Màu ghi"}
];

const capacities = [
  {id:"1L", label:"1L", prices:{transparent:195000, gray:205000}},
  {id:"5L", label:"5L", prices:{transparent:670000, gray:723000}},
  {id:"18L", label:"18L", prices:{transparent:2236000, gray:2300000}}
];

const state = {
  color: "transparent",
  capacity: "5L",
  quantity: 1,
  touched: new Set()
};

const money = new Intl.NumberFormat("vi-VN");
const formatMoney = value => `${money.format(value)}đ`;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const productList = $("#productList");
const colorOptions = $("#colorOptions");
const capacityOptions = $("#capacityOptions");
const orderForm = $(".order-form");
const successState = $(".success-state");
const summarySubtotal = $("#summarySubtotal");
const summaryDiscountRow = $("#summaryDiscountRow");
const summaryDiscount = $("#summaryDiscount");
const summaryTotal = $("#summaryTotal");
const offerList = $("#offerList");
const quantityValue = $("#quantityValue");
const menuToggle = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");
const officePhone = $("#officePhone");

function trackEvent(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event:eventName, ...payload});
  if (typeof window.gtag === "function") window.gtag("event", eventName, payload);
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName === "purchase_or_lead_submit" ? "Lead" : eventName, payload);
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

function selectedColor() {
  return colors.find(item => item.id === state.color) || colors[0];
}

function selectedCapacity() {
  return capacities.find(item => item.id === state.capacity) || capacities[0];
}

function unitPriceFor(capacityItem = selectedCapacity(), colorId = state.color) {
  return capacityItem.prices[colorId] || capacityItem.prices.transparent;
}

function discountFor(capacityId = state.capacity, quantity = state.quantity) {
  if (quantity < 2) return 0;
  if (capacityId === "1L") return (quantity - 1) * 25000;
  return 50000 + ((quantity - 2) * 25000);
}

function giftFor(capacityId = state.capacity, quantity = state.quantity) {
  if (capacityId === "1L") return "1 chổi quét";
  if (capacityId === "5L") return quantity >= 2 ? "1 con lăn + 1 chổi quét" : "1 con lăn";
  return quantity >= 2 ? "2 con lăn + 1 chổi quét" : "1 con lăn + 1 chổi quét";
}

function totalsFor(capacityId = state.capacity, colorId = state.color, quantity = state.quantity) {
  const capacityItem = capacities.find(item => item.id === capacityId) || capacities[0];
  const unitPrice = unitPriceFor(capacityItem, colorId);
  const subtotal = unitPrice * quantity;
  const discount = discountFor(capacityItem.id, quantity);
  return {capacityItem, unitPrice, subtotal, discount, total:subtotal - discount};
}

function scrollToOrder() {
  trackEvent("click_buy");
  $("#order").scrollIntoView({behavior:"smooth", block:"start"});
}

function packageForProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return null;
  return {
    color: product.color,
    capacity: product.volume,
    product
  };
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
}

function renderColorOptions() {
  colorOptions.innerHTML = colors.map(color => `
    <label class="color-card" data-color-card="${color.id}">
      <input type="radio" name="color" value="${color.id}">
      <span class="mini-check">✓</span>
      <strong>${color.label}</strong>
    </label>
  `).join("");
}

function renderCapacityOptions() {
  capacityOptions.innerHTML = capacities.map(capacityItem => `
    <label class="option-card capacity-card" data-capacity-card="${capacityItem.id}">
      <input type="radio" name="capacity" value="${capacityItem.id}">
      <i class="option-check" aria-hidden="true">✓</i>
      <span class="package-copy">
        <strong>${capacityItem.label}</strong>
        <span>${formatMoney(unitPriceFor(capacityItem))} / hộp</span>
      </span>
    </label>
  `).join("");
}

function syncSelection() {
  const totals = totalsFor();
  $$("input[name='color']").forEach(input => input.checked = input.value === state.color);
  $$(".color-card").forEach(card => card.classList.toggle("selected", card.dataset.colorCard === state.color));
  $$("input[name='capacity']").forEach(input => input.checked = input.value === state.capacity);
  $$(".capacity-card").forEach(card => card.classList.toggle("selected", card.dataset.capacityCard === state.capacity));
  quantityValue.textContent = state.quantity;
  summarySubtotal.textContent = formatMoney(totals.subtotal);
  summaryTotal.textContent = formatMoney(totals.total);
  if (totals.discount) {
    summaryDiscountRow.hidden = false;
    summaryDiscount.textContent = `-${formatMoney(totals.discount)}`;
  } else {
    summaryDiscountRow.hidden = true;
  }
  const isOneLiter = state.capacity === "1L";
  const promptSaving = isOneLiter ? 25000 : 50000;
  const promo = totals.discount
    ? `Đã giảm ${formatMoney(totals.discount)}`
    : `Mua thêm 1 hộp để được giảm ${formatMoney(promptSaving)}`;
  const extra = totals.discount
    ? (isOneLiter ? "Mỗi hộp mua thêm tiếp tục giảm thêm 25.000đ" : "Mỗi hộp mua thêm được giảm thêm 25.000đ")
    : "";
  offerList.innerHTML = [
    promo,
    extra,
    "Miễn phí vận chuyển",
    `Tặng ${giftFor()}`
  ].filter(Boolean).map(item => `<li>${item}</li>`).join("");
}

function selectColor(colorId) {
  if (!colors.some(color => color.id === colorId)) return;
  state.color = colorId;
  renderCapacityOptions();
  syncSelection();
  clearError("color");
  trackEvent("select_product", {color: colorId, capacity: state.capacity, quantity: state.quantity, value: totalsFor().total, currency:"VND"});
}

function selectCapacity(capacityId, shouldScroll = false) {
  if (!capacities.some(item => item.id === capacityId)) return;
  state.capacity = capacityId;
  syncSelection();
  clearError("capacity");
  const totals = totalsFor();
  trackEvent("select_product", {color: state.color, capacity: capacityId, quantity: state.quantity, value: totals.total, currency:"VND"});
  if (shouldScroll) {
    scrollToOrder();
    setTimeout(() => {
      const card = $(`[data-capacity-card="${capacityId}"]`);
      card?.classList.add("highlight-pulse");
      card?.scrollIntoView({behavior:"smooth", block:"center"});
      setTimeout(() => card?.classList.remove("highlight-pulse"), 900);
    }, 350);
  }
}

function changeQuantity(delta) {
  state.quantity = Math.max(1, state.quantity + delta);
  syncSelection();
  const totals = totalsFor();
  trackEvent("select_product", {color: state.color, capacity: state.capacity, quantity: state.quantity, value: totals.total, currency:"VND"});
}

function setError(name, message) {
  const error = $(`[data-error-for="${name}"]`);
  if (!error) return;
  error.textContent = message;
  error.closest(".field")?.classList.add("invalid");
}

function clearError(name) {
  const error = $(`[data-error-for="${name}"]`);
  if (!error) return;
  error.textContent = "";
  error.closest(".field")?.classList.remove("invalid");
}

function validateField(name) {
  const value = String(orderForm.elements[name]?.value || "").trim();
  clearError(name);
  if (name === "fullName" && !value) {
    setError(name, "Vui lòng nhập họ và tên.");
    return false;
  }
  if (name === "phone") {
    const phone = value.replace(/\s|\.|-/g, "");
    if (!value) {
      setError(name, "Vui lòng nhập số điện thoại.");
      return false;
    }
    if (!/^(0|\+84)(\d{8,10})$/.test(phone)) {
      setError(name, "Số điện thoại chưa hợp lệ.");
      return false;
    }
  }
  if (name === "address" && !value) {
    setError(name, "Vui lòng nhập địa chỉ nhận hàng.");
    return false;
  }
  return true;
}

function validateForm() {
  const checks = ["fullName", "phone", "address"];
  const invalid = checks.filter(name => !validateField(name));
  if (!state.color) {
    setError("color", "Vui lòng chọn màu.");
    invalid.push("color");
  }
  if (!state.capacity) {
    setError("capacity", "Vui lòng chọn dung tích.");
    invalid.push("capacity");
  }
  return invalid;
}

function scrollToFirstError(errors) {
  const firstName = errors[0];
  const error = $(`[data-error-for="${firstName}"]`);
  const target = error?.closest(".field,.color-options,.package-options") || error;
  target?.scrollIntoView({behavior:"smooth", block:"center"});
}

function buildOrderPayload(formData) {
  const totals = totalsFor();
  const colorLabel = selectedColor().label === "MÀU GHI" ? "Màu ghi" : "Trong suốt";
  const packageName = `TNANO ${state.capacity} ${colorLabel} x ${state.quantity}`;
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    color: state.color,
    capacity: state.capacity,
    unitPrice: totals.unitPrice,
    quantity: state.quantity,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    gift: giftFor(),
    freeShipping: true,
    packageName,
    pageUrl: window.location.href,
    timestamp: new Date().toISOString(),
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
  const colorLabel = selectedColor().label;
  successState.querySelector(".success-summary").innerHTML = `
    <div><span>Tên khách:</span><strong>${payload.fullName}</strong></div>
    <div><span>Màu:</span><strong>${colorLabel}</strong></div>
    <div><span>Dung tích:</span><strong>${payload.capacity}</strong></div>
    <div><span>Số lượng:</span><strong>${payload.quantity} hộp</strong></div>
    <div><span>Ưu đãi:</span><strong>${payload.gift}</strong></div>
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
    const chosen = packageForProduct(button.dataset.buyProduct);
    if (!chosen) return;
    trackEvent("view_product", {product_id: chosen.product.id, product_name: chosen.product.fullName});
    trackEvent("begin_checkout", {product_id: chosen.product.id, product_name: chosen.product.fullName, value: chosen.product.price, currency:"VND"});
    state.quantity = 1;
    selectColor(chosen.color);
    selectCapacity(chosen.capacity, true);
  });

  colorOptions.addEventListener("click", event => {
    const card = event.target.closest(".color-card");
    if (card) selectColor(card.dataset.colorCard);
  });

  capacityOptions.addEventListener("click", event => {
    const card = event.target.closest(".capacity-card");
    if (card) selectCapacity(card.dataset.capacityCard);
  });

  $$(".quantity-btn").forEach(button => {
    button.addEventListener("click", () => changeQuantity(Number(button.dataset.quantityChange || 0)));
  });

  $$(".js-buy").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const totals = totalsFor();
      trackEvent("begin_checkout", {color: state.color, capacity: state.capacity, quantity: state.quantity, value: totals.total, currency:"VND"});
      scrollToOrder();
    });
  });

  $$(".faq-item").forEach(item => {
    item.addEventListener("click", () => item.classList.toggle("active"));
  });

  ["fullName", "phone", "address"].forEach(name => {
    const field = orderForm.elements[name];
    field.addEventListener("blur", () => {
      state.touched.add(name);
      validateField(name);
    });
    field.addEventListener("input", () => {
      if (state.touched.has(name)) validateField(name);
    });
  });

  orderForm.addEventListener("submit", async event => {
    event.preventDefault();
    state.touched = new Set(["fullName", "phone", "address"]);
    const errors = validateForm();
    if (errors.length) {
      scrollToFirstError(errors);
      return;
    }

    const submitButton = orderForm.querySelector(".order-submit");
    const payload = buildOrderPayload(new FormData(orderForm));
    submitButton.classList.add("is-loading");
    submitButton.disabled = true;

    try {
      await submitOrder(payload);
      trackEvent("purchase_or_lead_submit", {
        color: payload.color,
        package_name: payload.packageName,
        value: payload.total,
        capacity: payload.capacity,
        unit_price: payload.unitPrice,
        subtotal: payload.subtotal,
        discount: payload.discount,
        gift: payload.gift,
        free_shipping: payload.freeShipping,
        currency: "VND",
        quantity: payload.quantity
      });
      showSuccess(payload);
    } catch (error) {
      $(".form-message").textContent = "Chưa gửi được đơn hàng. Vui lòng thử lại sau.";
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

function initCarousels() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const dotsWrap = carousel.querySelector(".carousel-dots");
    if (!track || slides.length < 2) return;

    let index = 0;
    let timer = null;
    let pauseTimer = null;
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    dotsWrap.innerHTML = slides.map((_, dotIndex) => `<span class="carousel-dot${dotIndex === 0 ? " active" : ""}"></span>`).join("");
    const dots = Array.from(dotsWrap.querySelectorAll(".carousel-dot"));

    const render = () => {
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    };

    const goTo = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      render();
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (reduceMotion || timer) return;
      timer = setInterval(() => goTo(index + 1), 4000);
    };

    const pauseThenResume = () => {
      stop();
      if (pauseTimer) clearTimeout(pauseTimer);
      pauseTimer = setTimeout(start, 5000);
    };

    const dragTo = clientX => {
      currentX = clientX;
      const delta = currentX - startX;
      track.style.transition = "none";
      track.style.transform = `translateX(calc(${-index * 100}% + ${delta}px))`;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      const delta = currentX - startX;
      const threshold = carousel.clientWidth * 0.18;
      if (Math.abs(delta) > threshold) goTo(index + (delta < 0 ? 1 : -1));
      else render();
      pauseThenResume();
    };

    carousel.addEventListener("touchstart", event => {
      if (!event.touches.length) return;
      dragging = true;
      startX = event.touches[0].clientX;
      currentX = startX;
      pauseThenResume();
    }, {passive:true});

    carousel.addEventListener("touchmove", event => {
      if (!dragging || !event.touches.length) return;
      dragTo(event.touches[0].clientX);
    }, {passive:true});

    carousel.addEventListener("touchend", endDrag);
    carousel.addEventListener("touchcancel", endDrag);
    start();
  });
}

renderProductCards();
renderColorOptions();
renderCapacityOptions();
bindEvents();
initCarousels();
syncSelection();
if (officePhone && OFFICE_PHONE) {
  officePhone.textContent = OFFICE_PHONE;
  officePhone.href = `tel:${OFFICE_PHONE_TEL}`;
}
