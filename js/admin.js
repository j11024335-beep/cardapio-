// admin.js - Painel de Controle
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = 'login.html';
    else init();
});

function init() {
    loadProducts();
    loadConfig();
    setupForms();
    document.getElementById('logout-btn').onclick = () => signOut(auth);
}

// Converter arquivo para Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function loadProducts() {
    onValue(ref(db, 'produtos'), (snapshot) => {
        const data = snapshot.val();
        const list = document.getElementById('list-prod');
        list.innerHTML = '';
        if (data) {
            Object.keys(data).forEach(id => {
                const p = data[id];
                list.innerHTML += `
                    <tr>
                        <td><img src="${p.imagemUrl || 'assets/placeholder.jpg'}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
                        <td>${p.nome}</td>
                        <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                        <td>
                            <button onclick="editP('${id}')">✏️</button>
                            <button onclick="delP('${id}')">🗑️</button>
                        </td>
                    </tr>
                `;
            });
        }
    });
}

window.editP = (id) => {
    onValue(ref(db, `produtos/${id}`), (s) => {
        const p = s.val();
        document.getElementById('p-id').value = id;
        document.getElementById('p-name').value = p.nome;
        document.getElementById('p-desc').value = p.descricao;
        document.getElementById('p-price').value = p.preco;
        document.getElementById('p-cat').value = p.categoria;
        document.getElementById('v-prod').value = p.imagemUrl || '';
        document.getElementById('m-title').innerText = 'Editar Produto';
        document.getElementById('modal-prod').style.display = 'flex';
    }, { onlyOnce: true });
};

window.delP = (id) => {
    if(confirm("Excluir produto?")) remove(ref(db, `produtos/${id}`));
};

window.openProdModal = () => {
    document.getElementById('form-prod').reset();
    document.getElementById('p-id').value = '';
    document.getElementById('v-prod').value = '';
    document.getElementById('m-title').innerText = 'Novo Produto';
    document.getElementById('modal-prod').style.display = 'flex';
};

window.closeProdModal = () => document.getElementById('modal-prod').style.display = 'none';

function setupForms() {
    // Imagem do Produto
    document.getElementById('f-prod').onchange = async (e) => {
        const file = e.target.files[0];
        if(file) document.getElementById('v-prod').value = await toBase64(file);
    };

    // Imagem Logo e Banner
    document.getElementById('f-logo').onchange = async (e) => {
        const file = e.target.files[0];
        if(file) document.getElementById('v-logo').value = await toBase64(file);
    };
    document.getElementById('f-banner').onchange = async (e) => {
        const file = e.target.files[0];
        if(file) document.getElementById('v-banner').value = await toBase64(file);
    };

    // Salvar Produto
    document.getElementById('form-prod').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('p-id').value;
        const data = {
            nome: document.getElementById('p-name').value,
            descricao: document.getElementById('p-desc').value,
            preco: parseFloat(document.getElementById('p-price').value),
            categoria: document.getElementById('p-cat').value,
            imagemUrl: document.getElementById('v-prod').value
        };

        if(id) await update(ref(db, `produtos/${id}`), data);
        else await push(ref(db, 'produtos'), data);
        
        closeProdModal();
        Toastify({ text: "Produto salvo!", backgroundColor: "green" }).showToast();
    };

    // Salvar Config
    document.getElementById('form-conf').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            nome: document.getElementById('c-name').value,
            whatsapp: document.getElementById('c-phone').value,
            logoUrl: document.getElementById('v-logo').value,
            bannerUrl: document.getElementById('v-banner').value,
            bannerTitulo: document.getElementById('c-btitle').value,
            bannerDesc: document.getElementById('c-bdesc').value
        };
        await set(ref(db, 'configuracoes'), data);
        Toastify({ text: "Configurações salvas!", backgroundColor: "green" }).showToast();
    };
}

function loadConfig() {
    onValue(ref(db, 'configuracoes'), (s) => {
        const d = s.val();
        if(d) {
            document.getElementById('c-name').value = d.nome || '';
            document.getElementById('c-phone').value = d.whatsapp || '';
            document.getElementById('v-logo').value = d.logoUrl || '';
            document.getElementById('v-banner').value = d.bannerUrl || '';
            document.getElementById('c-btitle').value = d.bannerTitulo || '';
            document.getElementById('c-bdesc').value = d.bannerDesc || '';
        }
    });
}
