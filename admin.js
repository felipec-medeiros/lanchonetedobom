// Elementos do DOM
const ordersContainer = document.getElementById('orders-container');
const statusFilter = document.getElementById('status-filter');

// Configuração do Filtro
let filtroAtual = 'todos';

// Event Listener para o Filtro
statusFilter.addEventListener('change', (e) => {
    filtroAtual = e.target.value;
    carregarPedidos();
});

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    
    // Atualização Automática a cada 10 segundos!
    // Para recarregar pedidos novos sem precisar dar F5 na página
    setInterval(carregarPedidos, 10000);
});

// === FUNÇÕES PRINCIPAIS ===

function carregarPedidos() {
    const pedidosString = localStorage.getItem('lanchonete_pedidos');
    let pedidos = [];
    
    if (pedidosString) {
        pedidos = JSON.parse(pedidosString);
    }

    renderizarPedidos(pedidos);
}

function renderizarPedidos(pedidos) {
    ordersContainer.innerHTML = ''; // Limpa o container

    // Aplicar filtro
    let pedidosFiltrados = pedidos;
    if (filtroAtual !== 'todos') {
        pedidosFiltrados = pedidos.filter(p => p.status === filtroAtual);
    }

    // Ordenar do mais novo para o mais antigo (opcional, mas bom pra UX)
    pedidosFiltrados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

    if (pedidosFiltrados.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center" style="color: var(--text-light); padding: 2rem;">Nenhum pedido encontrado.</p>';
        return;
    }

    pedidosFiltrados.forEach(pedido => {
        const card = document.createElement('div');
        // Classe fixa de card + classe dinâmica baseada no status (css: status-pendente, status-preparo...)
        card.className = `order-card status-${pedido.status}`;

        // Formatador de Data/Hora
        const dataPedido = new Date(pedido.dataHora).toLocaleString('pt-BR');

        // Formatar Itens em uma string HTML de <li>
        const itensHTML = pedido.itens.map(item => `<li>${item.quantidade}x ${item.nome}</li>`).join('');

        // Badge de Status e Botões de Ação
        let badgeClass = '';
        let botoesHTML = '';

        switch(pedido.status) {
            case 'pendente':
                badgeClass = 'bg-pendente';
                botoesHTML = `
                    <button class="btn-small btn-preparo" onclick="alterarStatus('${pedido.id}', 'preparo')">Preparar</button>
                    <button class="btn-small btn-cancelar" onclick="alterarStatus('${pedido.id}', 'cancelado')">Cancelar</button>
                `;
                break;
            case 'preparo':
                badgeClass = 'bg-preparo';
                botoesHTML = `
                    <button class="btn-small btn-entregue" onclick="alterarStatus('${pedido.id}', 'entregue')">Marcar Entregue</button>
                    <button class="btn-small btn-cancelar" onclick="alterarStatus('${pedido.id}', 'cancelado')">Cancelar</button>
                `;
                break;
            case 'entregue':
                badgeClass = 'bg-entregue';
                // Sem botões pois já finalizou
                break;
            case 'cancelado':
                badgeClass = 'bg-cancelado';
                // Sem botões pois já finalizou
                break;
        }

        // Tradução manual da string do status para exibir na Badge
        const statusTexto = pedido.status === 'preparo' ? 'Em Preparo' : pedido.status;

        card.innerHTML = `
            <div>
                <div class="order-header">
                    <span class="order-id">${pedido.id}</span>
                </div>
                <div class="order-customer">${pedido.clienteNome}</div>
                <div class="order-address">
                    📞 ${pedido.telefone}<br>
                    📍 ${pedido.endereco}<br>
                    🕒 ${dataPedido}
                </div>
            </div>
            
            <div class="order-items">
                <strong>Itens do Pedido:</strong>
                <ul>
                    ${itensHTML}
                </ul>
            </div>

            <div class="order-total-status">
                <div style="font-size: 1.2rem; font-weight: bold;">
                    ${pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div class="badge ${badgeClass}">${statusTexto}</div>
                
                <div class="order-actions">
                    ${botoesHTML}
                </div>
            </div>
        `;

        ordersContainer.appendChild(card);
    });
}

// === FUNÇÃO DE ATUALIZAR STATUS ===
// Precisamos colocar a função no escopo global (window) porque ela é chamada por atributo onclick no HTML formatado via string.
window.alterarStatus = function(idPedido, novoStatus) {
    const pedidosString = localStorage.getItem('lanchonete_pedidos');
    if (!pedidosString) return;

    let pedidos = JSON.parse(pedidosString);
    
    // Procura o pedido pelo ID
    const indice = pedidos.findIndex(p => p.id === idPedido);
    
    if (indice !== -1) {
        // Atualiza
        pedidos[indice].status = novoStatus;
        
        // Salva novamente
        localStorage.setItem('lanchonete_pedidos', JSON.stringify(pedidos));
        
        // Recarrega a tela
        carregarPedidos();
    }
};
