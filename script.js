/* receipt page */
const menuListEl = document.getElementById('menuList');

if (menuListEl) {
  // drink list and price
  const MENU = [
    { id: 'americano', name: 'Americano', price: 99 },
    { id: 'spanishLatte', name: 'Spanish Latte', price: 129 },
    { id: 'coldBrewMalt', name: 'Cold Brew Malt', price: 189 },
    { id: 'affogato', name: 'Affogato', price: 159 },
    { id: 'caramelMacchiato', name: 'Caramel Macchiato', price: 129 },
  ];

  // how many of each drink is picked like amount
  const quantities = {};
  MENU.forEach((item) => (quantities[item.id] = 0));

  let orderNumber = 1000;

  // show menu and buttons
  function renderMenu() {
    menuListEl.innerHTML = '';
    MENU.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'menu-row';
      row.innerHTML = `
        <span class="menu-name">${item.name}</span>
        <span class="menu-price">₱${item.price}</span>
        <div class="qty-control">
          <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button>
          <span class="qty-value" id="qty-${item.id}">${quantities[item.id]}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
        </div>
      `;
      menuListEl.appendChild(row);
    });
  }

  // add or remove items
  menuListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'inc') {
      quantities[id] += 1;
    } else if (quantities[id] > 0) {
      quantities[id] -= 1;
    }
    document.getElementById(`qty-${id}`).textContent = quantities[id];
  });

  renderMenu();

  const customerNameInput = document.getElementById('customerName');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const outputBox = document.getElementById('outputBox');
  const createOrderBtn = document.getElementById('createOrderBtn');
  const resetBtn = document.getElementById('resetBtn');

  function clearFieldError(field) {
    field.closest('.field').classList.remove('error');
  }

  function setFieldError(field) {
    field.closest('.field').classList.add('error');
  }

  createOrderBtn.addEventListener('click', () => {
    // checking the name
    const name = customerNameInput.value.trim();
    if (!name) {
      setFieldError(customerNameInput);
      customerNameInput.focus();
      return;
    }
    clearFieldError(customerNameInput);

    // only keep items with amount more than 0
    const orderedItems = MENU.filter((item) => quantities[item.id] > 0);
    if (orderedItems.length === 0) {
      outputBox.innerHTML =
        '<p class="output-placeholder">Add at least one item using the + buttons above.</p>';
      return;
    }

    // total price of the orders
    let total = 0;
    const lines = orderedItems
      .map((item) => {
        const qty = quantities[item.id];
        const subtotal = qty * item.price;
        total += subtotal;
        return `<div class="receipt-line">
                  <span>${item.name} × ${qty}</span>
                  <span>₱${subtotal}</span>
                </div>`;
      })
      .join('');

    orderNumber += 1;
    const now = new Date();
    const timestamp = now.toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    outputBox.innerHTML = `
      <div class="receipt-line"><span>Order #</span><span>OB-${orderNumber}</span></div>
      <div class="receipt-line"><span>Customer</span><span>${name}</span></div>
      <div class="receipt-line"><span>Payment</span><span>${paymentMethodSelect.value}</span></div>
      <div class="receipt-line"><span>Date</span><span>${timestamp}</span></div>
      <hr style="border:none;border-top:1px dashed var(--line);margin:8px 0;">
      ${lines}
      <div class="receipt-line total"><span>Total</span><span>₱${total}</span></div>
    `;
  });

  resetBtn.addEventListener('click', () => {
    MENU.forEach((item) => (quantities[item.id] = 0));
    renderMenu();
    customerNameInput.value = '';
    paymentMethodSelect.value = 'Cash';
    clearFieldError(customerNameInput);
    outputBox.innerHTML =
      '<p class="output-placeholder">Your order summary will appear here.</p>';
  });
}

/* sku page */
const generateBtn = document.getElementById('generateBtn');

if (generateBtn) {
  const categorySelect = document.getElementById('category');
  const productNameInput = document.getElementById('productName');
  const stockQuantityInput = document.getElementById('stockQuantity');
  const skuOutputBox = document.getElementById('skuOutputBox');
  const resetSkuBtn = document.getElementById('resetSkuBtn');

  function clearFieldError(field) {
    field.closest('.field').classList.remove('error');
  }

  function setFieldError(field) {
    field.closest('.field').classList.add('error');
  }

  // short code for product name
  // first letter of each word for 2-word names
  // first 2 letters for 1-word names
  function productInitials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    let initials;
    if (words.length >= 2) {
      initials = words.map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    } else {
      initials = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 2);
    }
    return initials.padEnd(2, 'X');
  }

  generateBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    const productName = productNameInput.value.trim();
    const rawQty = stockQuantityInput.value;

    // check product name
    const nameValid = productName.length > 0 && /[a-zA-Z0-9]/.test(productName);
    if (!nameValid) {
      setFieldError(productNameInput);
    } else {
      clearFieldError(productNameInput);
    }

    // the amount of items from 0 to 999
    const qty = parseInt(rawQty, 10);
    const qtyValid = rawQty !== '' && Number.isInteger(qty) && qty >= 0 && qty <= 999;
    if (!qtyValid) {
      setFieldError(stockQuantityInput);
    } else {
      clearFieldError(stockQuantityInput);
    }

    if (!nameValid || !qtyValid) return;

    // make the code
    const categoryCode = category.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
    const productCode = productInitials(productName);
    const qtyCode = String(qty).padStart(3, '0');
    const sku = `${categoryCode}${productCode}${qtyCode}`;

    skuOutputBox.innerHTML = `
      <div class="sku-result">
        <div class="sku-code">${sku}</div>
        <div class="barcode"></div>
        <div class="sku-breakdown">
          <span class="sku-chip">Category: ${categoryCode}</span>
          <span class="sku-chip">Product: ${productCode}</span>
          <span class="sku-chip">Qty: ${qtyCode}</span>
        </div>
      </div>
    `;
  });

  resetSkuBtn.addEventListener('click', () => {
    productNameInput.value = '';
    stockQuantityInput.value = '';
    categorySelect.selectedIndex = 0;
    clearFieldError(productNameInput);
    clearFieldError(stockQuantityInput);
    skuOutputBox.innerHTML =
      '<p class="output-placeholder" id="skuPlaceholder">Your generated SKU will appear here.</p>';
  });
}
