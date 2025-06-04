// ===== VARIABLES GLOBALES =====
let users = JSON.parse(localStorage.getItem("users") || "[]");
let products = JSON.parse(localStorage.getItem("products") || "[]");
let currentUser = null;
let editingProductId = null;

// ===== FUNCIONES DE NAVEGACIÓN =====
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function showAlert(containerId, message, type) {
  const alertContainer = document.getElementById(containerId);
  alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}

// ===== FUNCIONES DE AUTENTICACIÓN =====
function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  // Verificar si el usuario ya existe
  if (users.find((user) => user.email === email)) {
    showAlert("registerAlert", "Este email ya está registrado", "error");
    return;
  }

  // Crear nuevo usuario
  const newUser = {
    id: users.length + 1,
    name: name,
    email: email,
    password: password, // En una app real, esto debería estar hasheado
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showAlert(
    "registerAlert",
    "Usuario registrado exitosamente. Redirigiendo al login...",
    "success"
  );

  setTimeout(() => {
    document.getElementById("registerForm").reset();
    showScreen("loginScreen");
  }, 2000);
}

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Buscar usuario
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    document.getElementById("currentUser").textContent = user.name;
    showAlert("loginAlert", "Login exitoso. Redirigiendo...", "success");

    setTimeout(() => {
      document.getElementById("loginForm").reset();
      showScreen("crudScreen");
      loadProducts();
    }, 1500);
  } else {
    showAlert("loginAlert", "Email o contraseña incorrectos", "error");
  }
}

function logout() {
  currentUser = null;
  showScreen("homeScreen");
  document.getElementById("productForm").reset();
  editingProductId = null;
  updateProductFormUI();
}

// ===== FUNCIONES CRUD =====
function handleProductSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const description = document.getElementById("productDescription").value;

  if (editingProductId) {
    // Editar producto existente
    const productIndex = products.findIndex((p) => p.id === editingProductId);
    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        name: name,
        price: price,
        description: description,
      };
      showAlert("crudAlert", "Producto actualizado exitosamente", "success");
    }
    cancelEdit();
  } else {
    // Crear nuevo producto
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      name: name,
      price: price,
      description: description,
      userId: currentUser.id,
    };

    products.push(newProduct);
    showAlert("crudAlert", "Producto agregado exitosamente", "success");
  }

  localStorage.setItem("products", JSON.stringify(products));
  document.getElementById("productForm").reset();
  loadProducts();
}

function loadProducts() {
  const tbody = document.getElementById("productsTable");
  tbody.innerHTML = "";

  // Filtrar productos del usuario actual
  const userProducts = products.filter((p) => p.userId === currentUser.id);

  if (userProducts.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #666; font-style: italic;">
                    No hay productos registrados
                </td>
            </tr>
        `;
    return;
  }

  userProducts.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.description || "Sin descripción"}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editProduct(${
                  product.id
                })">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteProduct(${
                  product.id
                })">Eliminar</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (product) {
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value = product.description;

    editingProductId = id;
    updateProductFormUI();

    // Scroll al formulario
    document.getElementById("productForm").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function cancelEdit() {
  document.getElementById("productForm").reset();
  editingProductId = null;
  updateProductFormUI();
}

function updateProductFormUI() {
  const submitBtn = document.getElementById("productSubmitBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");

  if (editingProductId) {
    submitBtn.textContent = "Actualizar Producto";
    cancelBtn.style.display = "inline-block";
  } else {
    submitBtn.textContent = "Agregar Producto";
    cancelBtn.style.display = "none";
  }
}

function deleteProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const confirmMessage = `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`;

  if (confirm(confirmMessage)) {
    products = products.filter((p) => p.id !== id);
    localStorage.setItem("products", JSON.stringify(products));
    showAlert("crudAlert", "Producto eliminado exitosamente", "success");
    loadProducts();
  }
}

// ===== FUNCIONES DE UTILIDAD =====
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function clearAllData() {
  if (
    confirm(
      "¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer."
    )
  ) {
    localStorage.clear();
    users = [];
    products = [];
    currentUser = null;
    showScreen("homeScreen");
    alert("Todos los datos han sido eliminados.");
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", function () {
  // Event listeners para formularios
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("productForm")
    .addEventListener("submit", handleProductSubmit);

  // Inicializar UI
  updateProductFormUI();

  // Datos de ejemplo para desarrollo (opcional)
  if (users.length === 0) {
    console.log("Sistema inicializado - Base de datos vacía");

    // Uncomment para agregar datos de prueba:
    /*
        const testUser = {
            id: 1,
            name: 'Usuario de Prueba',
            email: 'test@test.com',
            password: '123456'
        };
        users.push(testUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Usuario de prueba creado: test@test.com / 123456');
        */
  }

  // Mensaje de bienvenida
  console.log("🚀 Sistema de Autenticación y CRUD cargado correctamente");
  console.log("📊 Usuarios registrados:", users.length);
  console.log("📦 Productos registrados:", products.length);
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener("error", function (e) {
  console.error("Error en la aplicación:", e.error);
  showAlert("crudAlert", "Ha ocurrido un error inesperado", "error");
});

// ===== FUNCIONES ADICIONALES DE DESARROLLO =====
// Estas funciones son útiles para desarrollo y debug
function exportData() {
  const data = {
    users: users,
    products: products,
    timestamp: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "sistema_datos_backup.json";
  link.click();
}

function getUserStats() {
  if (!currentUser) {
    console.log("No hay usuario logueado");
    return;
  }

  const userProducts = products.filter((p) => p.userId === currentUser.id);
  const totalValue = userProducts.reduce((sum, p) => sum + p.price, 0);

  console.log("📊 Estadísticas del usuario:", currentUser.name);
  console.log("📦 Productos:", userProducts.length);
  console.log("💰 Valor total:", "$" + totalValue.toFixed(2));

  return {
    user: currentUser.name,
    productCount: userProducts.length,
    totalValue: totalValue,
  };
}
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Mantener tema al recargar
window.onload = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeSwitch').checked = true;
  }
};
const darkBtn = document.getElementById('dark-mode-btn');
const lightBtn = document.getElementById('light-mode-btn');

darkBtn.addEventListener('click', () => {
  document.body.classList.add('dark-mode');
});

lightBtn.addEventListener('click', () => {
  document.body.classList.remove('dark-mode');
});
async function buscarProductos() {
  const q = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;

  try {
    const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`);
    const products = await res.json();

    const contenedor = document.getElementById('resultadosProductos');
    contenedor.innerHTML = '';

    if (products.length === 0) {
      contenedor.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    products.forEach(p => {
      contenedor.innerHTML += `
        <div class="producto-item" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
          <h4>${p.name}</h4>
          <p><strong>Precio:</strong> $${p.price?.toFixed(2) ?? 'N/A'}</p>
          <p><strong>Descripción:</strong> ${p.description ?? 'Sin descripción'}</p>
          <p><strong>Categoría:</strong> ${p.category ?? 'Sin categoría'}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
  }
}
function filtrarPorNombre() {
  const filtro = document.getElementById("nombreFiltro").value.toLowerCase();
  const tbody = document.getElementById("productsTable");

  tbody.innerHTML = "";

  const productosFiltrados = products
    .filter(p => p.userId === currentUser?.id)
    .filter(p => p.name.toLowerCase().includes(filtro));

  if (productosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #666; font-style: italic;">
          No hay productos que coincidan con el filtro
        </td>
      </tr>
    `;
    return;
  }

  productosFiltrados.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.description || "Sin descripción"}</td>
      <td>
        <button class="btn btn-small btn-warning" onclick="editProduct(${product.id})">Editar</button>
        <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
function exportarBusqueda(products) {
  const dataStr = JSON.stringify(products, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'resultados_busqueda.json';
  link.click();
}


