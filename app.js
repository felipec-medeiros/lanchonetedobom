// Banco de dados simulado de produtos
const produtos = [
    { id: 1, nome: 'X-Burguer Tradicional', descricao: 'Pão, carne artesanal 150g, queijo, alface e tomate.', preco: 25.90, categoria: 'Lanches', icone: '🍔' },
    { id: 2, nome: 'X-Bacon Especial', descricao: 'Pão, carne 150g, queijo cheddar, muito bacon e molho especial.', preco: 32.50, categoria: 'Lanches', icone: '🍔' },
    { id: 3, nome: 'Pizza Calabresa', descricao: 'Massa fina, molho de tomate, mussarela, calabresa e cebola.', preco: 45.00, categoria: 'Pizzas', icone: '🍕' },
    { id: 4, nome: 'Pizza Margherita', descricao: 'Massa estilo napolitana, molho, mussarela de búfala e manjericão.', preco: 48.00, categoria: 'Pizzas', icone: '🍕' },
    { id: 5, nome: 'Sorvete de Morango', descricao: '2 bolas de sorvete de morango com cobertura.', preco: 12.00, categoria: 'Sorvetes', icone: '🍦' },
    { id: 6, nome: 'Milkshake de Chocolate', descricao: '400ml de pura cremosidade com chantilly.', preco: 18.00, categoria: 'Sorvetes', icone: '🥤' },
    { id: 7, nome: 'Refrigerante Cola Lata', descricao: 'Lata 350ml bem gelada.', preco: 6.00, categoria: 'Bebidas', icone: '🥤' },
    { id: 8, nome: 'Suco de Laranja Natural', descricao: 'Copo 400ml feito na hora.', preco: 9.00, categoria: 'Bebidas', icone: '🍊' }
];

// Estado do Carrinho
let carrinho = [];

// Elementos do DOM
const menuSection = document.getElementById('menu-section');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutContainer = document.getElementById('checkout-form-container');
const checkoutForm = document.getElementById('checkout-form');
const toastIdElement = document.getElementById('toast-id');
const toastElement = document.getElementById('toast');

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizar os produtos
    renderizarMenu();
    // 2. Tentar recuperar o carrinho do localStorage (opcional, mas bom pra UX)
    const carrinhoSalvo = localStorage.getItem('lanchonete_carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        atualizarCarrinho();
    }
});

// === FUNÇÕES DE RENDERIZAÇÃO ===
function renderizarMenu() {
    // Agrupar produtos por categoria
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    
    categorias.forEach(categoria => {
        // Criar container da categoria
        const catDiv = document.createElement('div');
        catDiv.className = 'category-section';
        catDiv.innerHTML = `<h2 class="category-title">${categoria}</h2>`;
        
        // Criar grid de produtos
        const grid = document.createElement('div');
        grid.className = 'products-grid';

        // Filtrar e adicionar produtos desta categoria
        const produtosCategoria = produtos.filter(p => p.categoria === categoria);
        produtosCategoria.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Formatador de moeda local (Brasil)
            const precoFormatado = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            card.innerHTML = `
                <div class="product-icon">${produto.icone}</div>
                <h3 class="product-name">${produto.nome}</h3>
                <p class="product-desc">${produto.descricao}</p>
                <div class="product-price">${precoFormatado}</div>
                <button class="btn" onclick="adicionarAoCarrinho(${produto.id})">Adicionar</button>
            `;
            grid.appendChild(card);
        });

        catDiv.appendChild(grid);
        menuSection.appendChild(catDiv);
    });
}

function atualizarCarrinho() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center" style="color: var(--text-light); margin-top: 2rem;">Seu carrinho está vazio.</p>';
        checkoutContainer.classList.add('hidden');
        cartTotalPrice.textContent = 'R$ 0,00';
        localStorage.removeItem('lanchonete_carrinho');
        return;
    }

    carrinho.forEach((item, index) => {
        const itemTotal = item.preco * item.quantidade;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <span><strong>${item.quantidade}x</strong> ${item.nome}</span>
                <span style="font-size: 0.85rem; color: var(--text-light)">${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <button class="remove-btn" onclick="removerDoCarrinho(${index})">X</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalPrice.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    checkoutContainer.classList.remove('hidden');
    
    // Salva carrinho temporário
    localStorage.setItem('lanchonete_carrinho', JSON.stringify(carrinho));
}

// === LÓGICA DO CARRINHO ===
function adicionarAoCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    // Verifica se já existe no carrinho para somar quantidade
    const indexExistente = carrinho.findIndex(item => item.id === produtoId);
    
    if (indexExistente >= 0) {
        carrinho[indexExistente].quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    atualizarCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// === FINALIZAÇÃO DO PEDIDO ===
checkoutForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita o reload da página

    if (carrinho.length === 0) {
        alert("Adicione itens ao carrinho antes de finalizar!");
        return;
    }

    // Coletar dados do formulário
    const nome = document.getElementById('cliente-nome').value;
    const telefone = document.getElementById('cliente-telefone').value;
    const endereco = document.getElementById('cliente-endereco').value;

    // Calcular Total
    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    // Gerar um ID único usando Date
    const idPedido = 'PED-' + Math.floor(Math.random() * 10000) + '-' + Date.now().toString().slice(-4);

    // Montar Objeto Pedido
    const novoPedido = {
        id: idPedido,
        clienteNome: nome,
        telefone: telefone,
        endereco: endereco,
        itens: [...carrinho],
        total: total,
        status: 'pendente', // pendente, preparo, entregue, cancelado
        dataHora: new Date().toISOString()
    };

    // Salvar no LocalStorage (simulando Banco de Dados)
    salvarPedido(novoPedido);

    // Limpar state e mostrar Sucesso
    carrinho = [];
    atualizarCarrinho();
    checkoutForm.reset();

    // Feedback Visual
    mostrarToast(idPedido);
});

function salvarPedido(pedido) {
    // Ler pedidos existentes ou criar array vazio
    const pedidosString = localStorage.getItem('lanchonete_pedidos');
    let listaPedidos = [];
    
    if (pedidosString) {
        listaPedidos = JSON.parse(pedidosString);
    }
    
    // Adicionar o novo na lista
    listaPedidos.push(pedido);
    
    // Salvar novamente no localStorage
    localStorage.setItem('lanchonete_pedidos', JSON.stringify(listaPedidos));
}

function mostrarToast(id) {
    toastIdElement.textContent = id;
    toastElement.classList.add('show');
    
    // Ocultar após 5 segundos
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 5000);
}
