// script.js - Cardápio Público
import { db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let products = [];
let cart = [];
let storeConfig = {};
let currentCategory = 'todos';

const productsContainer = document.getElementById('products-container');
const cartCount = document.getElementById('cart-count');
const loadingScreen = document.getElementById('loading-screen');

document.addEventListener('DOMContentLoaded', () => {
    syncData();
    setupEvents();
});

function syncData() {
    // Sincronizar Configurações
    onValue(ref(db, 'configuracoes'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            storeConfig = data;
            document.getElementById('store-name').innerText = data.nome || 'Minha Loja';
            document.getElementById('footer-text').innerText = `© 2024 ${data.nome || 'Minha Loja'}`;
            if (data.logoUrl) document.getElementById('store-logo').src = data.logoUrl;
            if (data.bannerUrl) document.getElementById('banner-home').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${data.bannerUrl}')`;
            if (data.bannerTitulo) document.getElementById('banner-title').innerText = data.bannerTitulo;
            if (data.bannerDesc) document.getElementById('banner-desc').innerText = data.bannerDesc;
        }
    });

    // Sincronizar Produtos
    onValue(ref(db, 'produtos'), (snapshot) => {
        const data = snapshot.val();
        products = [];
        if (data) {
            Object.keys(data).forEach(key => {
                products.push({ id: key, ...data[key] });
            });
        }
        renderProducts();
        loadingScreen.style.display = 'none';
    });
}

function renderProducts() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => {
        const matchCat = currentCategory === 'todos' || p.categoria === currentCategory;
        const matchSearch = p.nome.toLowerCase().includes(search) || p.descricao.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });

    productsContainer.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="openModal('${p.id}')">
            <img src="${p.imagemUrl || 'assets/placeholder.jpg'}" alt="${p.nome}">
            <div class="product-info">
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
                <div class="product-footer">
                    <span class="price">R$ ${parseFloat(p.preco).toFixed(2)}</span>
                    <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.addToCart = (id) => {
    const p = products.find(prod => prod.id === id);
    const inCart = cart.find(item => item.id === id);
    if (inCart) inCart.qty++;
    else cart.push({ ...p, qty: 1 });
    updateCartUI();
    showToast(`${p.nome} adicionado!`);
};

function updateCartUI() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCount.innerText = totalQty;
    
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.nome}</h4>
                <span>${item.qty}x R$ ${parseFloat(item.preco).toFixed(2)}</span>
            </div>
            <div class="cart-item-actions">
                <button onclick="changeQty('${item.id}', -1)">-</button>
                <button onclick="changeQty('${item.id}', 1)">+</button>
            </div>
        </div>
    `).join('');

    const totalVal = cart.reduce((acc, item) => acc + (item.preco * item.qty), 0);
    document.getElementById('cart-total-value').innerText = `R$ ${totalVal.toFixed(2)}`;
}

window.changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    updateCartUI();
};

window.openModal = (id) => {
    const p = products.find(prod => prod.id === id);
    document.getElementById('modal-img').src = p.imagemUrl || 'assets/placeholder.jpg';
    document.getElementById('modal-title').innerText = p.nome;
    document.getElementById('modal-desc').innerText = p.descricao;
    document.getElementById('modal-price').innerText = `R$ ${parseFloat(p.preco).toFixed(2)}`;
    document.getElementById('modal-qty').innerText = '1';
    document.getElementById('product-modal').style.display = 'flex';
    
    document.getElementById('add-to-cart-btn').onclick = () => {
        const qty = parseInt(document.getElementById('modal-qty').innerText);
        for(let i=0; i<qty; i++) addToCart(id);
        document.getElementById('product-modal').style.display = 'none';
    };
};

function setupEvents() {
    document.getElementById('search-input').addEventListener('input', renderProducts);
    
    document.querySelectorAll('.categories-nav li').forEach(li => {
        li.onclick = () => {
            document.querySelector('.categories-nav li.active').classList.remove('active');
            li.classList.add('active');
            currentCategory = li.dataset.category;
            renderProducts();
        };
    });

    document.getElementById('open-cart').onclick = () => document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('active');
    
    document.querySelector('.close-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';
    
    document.getElementById('plus-qty').onclick = () => {
        const s = document.getElementById('modal-qty');
        s.innerText = parseInt(s.innerText) + 1;
    };
    document.getElementById('minus-qty').onclick = () => {
        const s = document.getElementById('modal-qty');
        if(parseInt(s.innerText) > 1) s.innerText = parseInt(s.innerText) - 1;
    };

    document.getElementById('checkout-btn').onclick = () => {
        if(cart.length === 0) return showToast("Carrinho vazio!");
        document.getElementById('checkout-modal').style.display = 'flex';
    };

    document.getElementById('checkout-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('cust-name').value;
        const addr = document.getElementById('cust-address').value;
        const pay = document.getElementById('cust-payment').value;
        const obs = document.getElementById('cust-obs').value;

        let msg = `*NOVO PEDIDO*\n\n*Cliente:* ${name}\n*Endereço:* ${addr}\n*Pagamento:* ${pay}\n`;
        if(obs) msg += `*Obs:* ${obs}\n`;
        msg += `\n*ITENS:*\n`;
        cart.forEach(i => msg += `- ${i.qty}x ${i.nome} (R$ ${(i.preco*i.qty).toFixed(2)})\n`);
        const total = cart.reduce((acc, i) => acc + (i.preco*i.qty), 0);
        msg += `\n*TOTAL: R$ ${total.toFixed(2)}*`;

        const phone = storeConfig.whatsapp || "5500000000000";
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
        cart = [];
        updateCartUI();
        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('cart-sidebar').classList.remove('active');
    };
}

function showToast(txt) {
    Toastify({ text: txt, duration: 2000, backgroundColor: "#ea1d2c" }).showToast();
}
