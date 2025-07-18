let cart = [];

async function loadSnacks() {
  const res = await fetch(`${API_BASE}?type=items`);
  const items = await res.json();

  const container = document.getElementById("snack-container");
  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "snack-item";
    div.innerHTML = `
      <h4>${item.name}</h4>
      <p>Price: $${item.price}</p>
      <p>Stock: ${item.stock}</p>
      <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  if (cart.length === 0) {
    cartDiv.innerHTML = "<p>Cart is empty.</p>";
    return;
  }

  let html = "<ul>";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    html += `<li>${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}</li>`;
  });
  html += `</ul><p><strong>Total: $${total.toFixed(2)}</strong></p>`;
  cartDiv.innerHTML = html;
}

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  document.getElementById("checkout-form").style.display = "block";
});

document.getElementById("submit-order").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const time = document.getElementById("delivery-time").value.trim();
  const location = document.getElementById("delivery-location").value.trim();

  if (!name || !time || !location) {
    alert("Please fill out all fields.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = {
    name,
    delivery_time: time,
    delivery_location: location,
    items: cart,
    total
  };

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      body: JSON.stringify({
        action: "addOrder",
        order
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      alert("Order placed successfully!");
      cart = [];
      renderCart();
      document.getElementById("checkout-form").style.display = "none";
      document.getElementById("name").value = "";
      document.getElementById("delivery-time").value = "";
      document.getElementById("delivery-location").value = "";
    } else {
      alert("Failed to place order. Try again.");
    }
  } catch (err) {
    alert("Error placing order.");
    console.error(err);
  }
});

// Load snack items when page loads
window.onload = loadSnacks;
