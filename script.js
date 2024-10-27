// Inicialização do mapa
var map = L.map('map').setView([-28.26185, -52.41545], 19);

// Adicionar uma camada de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
}).addTo(map);

// Ícones para os estados dos semáforos
var iconeVerde = L.icon({
    iconUrl: 'green.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
});

var iconeVermelho = L.icon({
    iconUrl: 'red.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
});

// Ícone personalizado para a localização do usuário
var iconeUsuario = L.icon({
    iconUrl: 'car.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// Modal
var modal = document.getElementById("modal");
var span = document.getElementsByClassName("close")[0];
var semaforoAtual; // Armazena o semáforo atualmente selecionado

// Fecha o modal quando o usuário clica no "X"
span.onclick = function() {
    modal.style.display = "none";
}

// Fecha o modal quando o usuário clica fora do conteúdo do modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Função para obter o estado do semáforo baseado no horário atual
function obterEstadoSemaforo(horarioVerdeInicial, duracaoFechado, cicloTotal) {
    var agora = new Date();
    var horarioBrasilia = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

    var partes = horarioVerdeInicial.split(':');
    var horas = parseInt(partes[0]);
    var minutos = parseInt(partes[1]);
    var segundos = parseInt(partes[2]);
    var milissegundos = parseInt(partes[3] || 0);

    var inicioSemaforo = new Date(horarioBrasilia);
    inicioSemaforo.setHours(horas, minutos, segundos, milissegundos);

    var tempoDecorrido = Math.floor((horarioBrasilia - inicioSemaforo) / 1000);
    if (tempoDecorrido < 0) {
        tempoDecorrido += 86400; // Ajusta para o ciclo de 24 horas
    }

    var tempoNoCiclo = tempoDecorrido % cicloTotal;

    return {
        estado: tempoNoCiclo < duracaoFechado ? 'vermelho' : 'verde',
        tempoRestante: tempoNoCiclo < duracaoFechado ? duracaoFechado - tempoNoCiclo : cicloTotal - tempoNoCiclo
    };
}

// Dados dos semáforos

    var semaforos = [
        {
            localizacao: 'Benjamin x BRaz',
            coords: [-28.259174, -52.403409],
            horarioVerdeInicial: '10:28:09',
            duracaoFechado: 42,
            cicloTotal: 140
        },
        {
            localizacao: 'Benjamin x indep',
            coords: [-28.261279, -52.402232],
            horarioVerdeInicial: '10:09:02',
            duracaoFechado: 42,
            cicloTotal: 140
        },
        {
            localizacao: 'Dr v x presvargas',
            coords: [-28.265356, -52.400408],
            horarioVerdeInicial: '10:09:02',
            duracaoFechado: 70,
            cicloTotal: 140
        },
        {
            localizacao: 'Benjamin x GenOsorio',
            coords: [-28.262403, -52.401465],
            horarioVerdeInicial: '10:25:15',
            duracaoFechado: 27,
            cicloTotal: 64
        },
        {
            localizacao: 'GenOsorio x FagundesReis',
            coords: [-28.262781, -52.402519],
            horarioVerdeInicial: '08:55:40',
            duracaoFechado: 70,
            cicloTotal: 140
        },
        {
            localizacao: 'GenOsorio x GenNeto',
            coords: [-28.26443, -52.405989],
            horarioVerdeInicial: '08:56:56',
            duracaoFechado: 50,
            cicloTotal: 100
        },
        {
            localizacao: 'Bento x GenOsorio',
            coords: [-28.26389, -52.40504],
            horarioVerdeInicial: '09:01:46',
            duracaoFechado: 70,
            cicloTotal: 140
        },
        {
            localizacao: 'cap. araujo, com uruguai',
            coords: [-28.26185, -52.41545],
            horarioVerdeInicial: '16:11:27',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'Nasc Vargas e Rua Bento Gonçalves',
            coords: [-28.255773, -52.409877],
            horarioVerdeInicial: '14:33:49',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'cap. araujo, av brasil',
            coords: [-28.26389, -52.41427],
            horarioVerdeInicial: '16:13:06',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'cap araujo general osorio',
            coords: [-28.26724, -52.41222],
            horarioVerdeInicial: '16:14:53',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'Av7 X CelChic',
            coords: [-28.265920, -52.406869],
            horarioVerdeInicial: '16:16:15',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'uruguai benjammin',
            coords: [-28.256755, -52.404849],
            horarioVerdeInicial: '14:32:15',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'Gen GUim x CelPel',
            coords: [-28.263903, -52.397264],
            horarioVerdeInicial: '14:32:15',
            duracaoFechado: 88,
            cicloTotal: 118
        },
        {
            localizacao: 'CelPel x genguim',
            coords: [-28.263809, -52.397339],
            horarioVerdeInicial: '14:32:15',
            duracaoFechado: 88,
            cicloTotal: 118
        },
];

// Função para adicionar os semáforos no mapa
function adicionarSemaforos() {
    semaforos.forEach(function(semaforo, index) {
        var armazenados = JSON.parse(localStorage.getItem(`semaforo_${index}`));
        if (armazenados) {
            semaforo.horarioVerdeInicial = armazenados.horarioVerdeInicial;
            semaforo.duracaoFechado = armazenados.duracaoFechado;
            semaforo.cicloTotal = armazenados.cicloTotal;
        }

        var estadoInfo = obterEstadoSemaforo(
            semaforo.horarioVerdeInicial, 
            semaforo.duracaoFechado, 
            semaforo.cicloTotal
        );

        var iconeAtual = estadoInfo.estado === 'verde' ? iconeVerde : iconeVermelho;

        var marcador = L.marker(semaforo.coords, { icon: iconeAtual }).addTo(map);
        
        var contagemDiv = L.divIcon({
            className: 'contagem',
            html: `${estadoInfo.tempoRestante} seg`,
            iconSize: [50, 20],
        });

        var contagemMarker = L.marker(semaforo.coords, { icon: contagemDiv }).addTo(map);

        marcador.bindPopup(`<b>${semaforo.localizacao}</b><br>Semáforo está: ${estadoInfo.estado}.<br>Tempo restante: ${estadoInfo.tempoRestante} segundos.`)
            .on('click', function() {
                modal.style.display = "block";
                document.getElementById("modal-title").innerText = semaforo.localizacao;
                document.getElementById("horarioVerdeInicial").value = semaforo.horarioVerdeInicial;
                document.getElementById("duracaoFechado").value = semaforo.duracaoFechado;
                document.getElementById("cicloTotal").value = semaforo.cicloTotal;
                semaforoAtual = semaforo;
            });

        setInterval(function() {
            estadoInfo = obterEstadoSemaforo(
                semaforo.horarioVerdeInicial, 
                semaforo.duracaoFechado, 
                semaforo.cicloTotal
            );

            contagemDiv.options.html = `${estadoInfo.tempoRestante} seg`;
            contagemMarker.setIcon(contagemDiv); 

            var novoIcone = estadoInfo.estado === 'verde' ? iconeVerde : iconeVermelho;
            marcador.setIcon(novoIcone);
            marcador.bindPopup(`<b>${semaforo.localizacao}</b><br>Semáforo está: ${estadoInfo.estado}.<br>Tempo restante: ${estadoInfo.tempoRestante} segundos.`);
        }, 1000);
    });
}

// Salva as alterações feitas no semáforo
document.getElementById("salvar").onclick = function() {
    var horarioVerdeInicial = document.getElementById("horarioVerdeInicial").value;
    var duracaoFechado = parseInt(document.getElementById("duracaoFechado").value);
    var cicloTotal = parseInt(document.getElementById("cicloTotal").value);

    semaforoAtual.horarioVerdeInicial = horarioVerdeInicial;
    semaforoAtual.duracaoFechado = duracaoFechado;
    semaforoAtual.cicloTotal = cicloTotal;

    var index = semaforos.indexOf(semaforoAtual);
    localStorage.setItem(`semaforo_${index}`, JSON.stringify({
        horarioVerdeInicial: horarioVerdeInicial,
        duracaoFechado: duracaoFechado,
        cicloTotal: cicloTotal
    }));

    modal.style.display = "none";
};

// Adiciona os semáforos ao mapa
adicionarSemaforos();

// Variável para o marcador do usuário (carro)
var userMarker = null;

// Função para atualizar a localização do usuário (carro)
function updateCarLocation(lat, lng) {
    if (userMarker) {
        userMarker.setLatLng([lat, lng]); // Atualiza a posição do marcador existente
    } else {
        // Cria o marcador apenas uma vez
        userMarker = L.marker([lat, lng], { icon: iconeUsuario }).addTo(map);
    }
}

// Função para remover o marcador do carro
function removeCarMarker() {
    if (userMarker) {
        map.removeLayer(userMarker); // Remove o marcador do mapa
        userMarker = null; // Reseta a variável para que possa ser recriado, se necessário
    }
}

// Configuração para obter e atualizar a localização do usuário em tempo real
navigator.geolocation.watchPosition(
    function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Chama a função de atualização do carro
        updateCarLocation(lat, lng);

        // Ajusta a visualização para seguir o usuário sem reiniciar o zoom
        map.setView([lat, lng], map.getZoom());
    },
    function(error) {
        console.log("Erro ao obter a localização do usuário: ", error);
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
);


