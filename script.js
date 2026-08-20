const ORDER_ENDPOINT = "";

const products = [
  {id:"tnano-1l-trong", name:"TNANO 1L TRONG", fullName:"Sơn Chống Thấm TNANO 1L TRONG", price:195000, volume:"1L", variant:"TRONG", color:"transparent", image:"./design/T3.jpg"},
  {id:"tnano-1l-pu", name:"TNANO 1L PU", fullName:"Sơn Chống Thấm TNANO 1L PU", price:205000, volume:"1L", variant:"PU", color:"gray", image:"./design/A2.jpg"},
  {id:"tnano-5l-trong", name:"TNANO 5L TRONG", fullName:"Sơn Chống Thấm TNANO 5L TRONG", price:670000, volume:"5L", variant:"TRONG", color:"transparent", image:"./design/A1.jpg"},
  {id:"tnano-5l-pu", name:"TNANO 5L PU", fullName:"Sơn Chống Thấm TNANO 5L PU", price:723000, volume:"5L", variant:"PU", color:"gray", image:"./design/A3.jpg"},
  {id:"tnano-18l-trong", name:"TNANO 18L TRONG", fullName:"Sơn Chống Thấm TNANO 18L TRONG", price:2236000, volume:"18L", variant:"TRONG", color:"transparent", image:"./design/A4.jpg"},
  {id:"tnano-18l-pu", name:"TNANO 18L PU", fullName:"Sơn Chống Thấm TNANO 18L PU", price:2300000, volume:"18L", variant:"PU", color:"gray", image:"./design/1787122930851_5062789529714247547_5062789529714247547_21a805e3d03f90b6d81da014fe5d1847.jpg"}
];

const colors = [
  {id:"transparent", label:"TRONG SUỐT", line:"Màu: Trong suốt"},
  {id:"gray", label:"MÀU GHI", line:"Màu: Màu ghi"}
];

const packages = [
  {id:"pkg-1l-1", name:"1 thùng 1L", capacity:"1L", quantity:1},
  {id:"pkg-1l-2", name:"Combo 2 thùng 1L", capacity:"1L", quantity:2, badge:"PHỔ BIẾN"},
  {id:"pkg-5l-1", name:"1 thùng 5L", capacity:"5L", quantity:1},
  {id:"pkg-5l-2", name:"Combo 2 thùng 5L", capacity:"5L", quantity:2, badge:"NÊN CHỌN"},
  {id:"pkg-18l-1", name:"1 thùng 18L", capacity:"18L", quantity:1},
  {id:"pkg-18l-2", name:"Combo 2 thùng 18L", capacity:"18L", quantity:2}
];

const state = {
  color: "transparent",
  packageId: "pkg-5l-2",
  touched: new Set()
};

const money = new Intl.NumberFormat("vi-VN");
const formatMoney = value => `${money.format(value)}đ`;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const productList = $("#productList");
const colorOptions = $("#colorOptions");
const packageOptions = $("#packageOptions");
const orderForm = $(".order-form");
const successState = $(".success-state");
const summaryTotal = $("#summaryTotal");
const menuToggle = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");

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

function unitPriceFor(packageItem, colorId = state.color) {
  const product = products.find(item => item.volume === packageItem.capacity && item.color === colorId);
  return product ? product.price : 0;
}

function totalFor(packageItem, colorId = state.color) {
  return unitPriceFor(packageItem, colorId) * packageItem.quantity;
}

function selectedPackage() {
  return packages.find(item => item.id === state.packageId) || packages[0];
}

function selectedColor() {
  return colors.find(item => item.id === state.color) || colors[0];
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
    packageId: packages.find(item => item.capacity === product.volume && item.quantity === 1)?.id || state.packageId,
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

function renderPackageOptions() {
  const colorLine = selectedColor().line;
  packageOptions.innerHTML = packages.map(packageItem => `
    <label class="option-card" data-option-card="${packageItem.id}">
      <input type="radio" name="packageId" value="${packageItem.id}">
      <i class="option-check" aria-hidden="true">✓</i>
      <span class="package-copy">
        <strong>${packageItem.name}</strong>
        <span>${colorLine}</span>
      </span>
      <span class="package-side">
        ${packageItem.badge ? `<em class="package-badge">${packageItem.badge}</em>` : ""}
        <b>${formatMoney(totalFor(packageItem))}</b>
      </span>
    </label>
  `).join("");
}

function syncSelection() {
  $$("input[name='color']").forEach(input => input.checked = input.value === state.color);
  $$(".color-card").forEach(card => card.classList.toggle("selected", card.dataset.colorCard === state.color));
  $$("input[name='packageId']").forEach(input => input.checked = input.value === state.packageId);
  $$(".option-card").forEach(card => card.classList.toggle("selected", card.dataset.optionCard === state.packageId));
  summaryTotal.textContent = formatMoney(totalFor(selectedPackage()));
}

function selectColor(colorId) {
  if (!colors.some(color => color.id === colorId)) return;
  state.color = colorId;
  renderPackageOptions();
  syncSelection();
  clearError("color");
  trackEvent("select_product", {color: colorId, package_id: state.packageId, value: totalFor(selectedPackage()), currency:"VND"});
}

function selectPackage(packageId, shouldScroll = false) {
  if (!packages.some(item => item.id === packageId)) return;
  state.packageId = packageId;
  syncSelection();
  clearError("packageId");
  const packageItem = selectedPackage();
  trackEvent("select_product", {color: state.color, package_id: packageId, package_name: packageItem.name, value: totalFor(packageItem), currency:"VND"});
  if (shouldScroll) {
    scrollToOrder();
    setTimeout(() => {
      const card = $(`[data-option-card="${packageId}"]`);
      card?.classList.add("highlight-pulse");
      card?.scrollIntoView({behavior:"smooth", block:"center"});
      setTimeout(() => card?.classList.remove("highlight-pulse"), 900);
    }, 350);
  }
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
  if (!state.packageId) {
    setError("packageId", "Vui lòng chọn gói đặt hàng.");
    invalid.push("packageId");
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
  const packageItem = selectedPackage();
  const unitPrice = unitPriceFor(packageItem);
  const total = unitPrice * packageItem.quantity;
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    color: state.color,
    packageId: packageItem.id,
    packageName: packageItem.name,
    capacity: packageItem.capacity,
    quantity: packageItem.quantity,
    unitPrice,
    total,
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
    <div><span>Gói:</span><strong>${payload.packageName}</strong></div>
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
    selectColor(chosen.color);
    selectPackage(chosen.packageId, true);
  });

  colorOptions.addEventListener("click", event => {
    const card = event.target.closest(".color-card");
    if (card) selectColor(card.dataset.colorCard);
  });

  packageOptions.addEventListener("click", event => {
    const card = event.target.closest(".option-card");
    if (card) selectPackage(card.dataset.optionCard);
  });

  $$(".js-buy").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      trackEvent("begin_checkout", {color: state.color, package_id: state.packageId, value: totalFor(selectedPackage()), currency:"VND"});
      scrollToOrder();
    });
  });

  $$("[data-track='click_call']").forEach(link => {
    link.addEventListener("click", () => trackEvent("click_call"));
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
        package_id: payload.packageId,
        package_name: payload.packageName,
        value: payload.total,
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

renderProductCards();
renderColorOptions();
renderPackageOptions();
bindEvents();
syncSelection();
