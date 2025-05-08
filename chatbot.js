const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const moment = require('moment');
const client = new Client();

let sessions = {};
const SESSIONS_FILE = './sessions.json';
if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
}

const saveSessions = () => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
};

const occupiedDates = ['25/12/2025', '31/12/2025', '01/01/2026'];

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', () => console.log('Tudo certo! WhatsApp conectado.'));

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('message', async msg => {
    const session = sessions[msg.from];

    // ✅ Opção 0: Cancelar e voltar ao menu principal
    if (msg.body === '0') {
        if (session) {
            delete sessions[msg.from];
            saveSessions();
        }
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo(a)';
        return client.sendMessage(msg.from, `
🎉Olá, ${name.split(" ")[0]}! Sou o assistente virtual da *Nossa Toca*

Como posso te ajudar? Digite uma das opções abaixo:
1️⃣ - Como funciona a locação
2️⃣ - Tipos de eventos e valores
3️⃣ - O que o espaço oferece
4️⃣ - Fazer uma pré-reserva
5️⃣ - Ver fotos e vídeos do ambiente
6️⃣ - Falar com um atendente

\n*Digite "0" a qualquer momento para voltar ao menu.*`.trim());
    }

    if (!session && msg.body.match(/^(menu|oi|olá|ola|tarde|noite)$/i)) {
        const contact = await msg.getContact();
        const name = contact.pushname || 'amigo(a)';

        return client.sendMessage(msg.from, `
🎉Olá, ${name.split(" ")[0]}! Sou o assistente virtual da *Nossa Toca*

Como posso te ajudar? Digite uma das opções abaixo:
1️⃣ - Como funciona a locação
2️⃣ - Tipos de eventos e valores
3️⃣ - O que o espaço oferece
4️⃣ - Fazer uma pré-reserva
5️⃣ - Ver fotos e vídeos do ambiente
6️⃣ - Falar com um atendente

\n*Digite "0" a qualquer momento para voltar ao menu.*`.trim());
    }

    if (!session && msg.body === '1') {
        return client.sendMessage(msg.from, `
🎉 *Como funciona a locação da Nossa Toca:*
🏡 Oferecemos o espaço completo para seu evento, onde *você pode levar sua própria comida e bebida*.

📅 Locação por diária (07h às 00h).
🧼 Espaço limpo e piscina pronta para uso.
💰 Valores variam por tipo e data do evento.
🔐 Pagamento: 50% na reserva + 50% no dia do evento.

Eventos: aniversários, casamentos, corporativos, familiares, etc.

\n*Digite "0" para voltar ao menu.*`.trim());
    }



    if (!session && msg.body === '2') {
        return client.sendMessage(msg.from, `
🎉 *Tipos de eventos e valores:*
1 - Casamento 💍 — R$750,00 (mínimo 3 diárias)
2 - Aniversário 🎂 — R$650,00
3 - Evento Familiar 👨‍👩‍👧‍👦 — R$650,00
4 - Evento Corporativo 🧑‍💼 — R$650,00

\n*Digite "0" para voltar ao menu.*`.trim());
    }



    if (!session && msg.body === '3') {
        return client.sendMessage(msg.from, `
🎉*O que o espaço oferece:*
✅Área de lazer coberta
🏊Piscina limpa e pronta para uso
🔥Churrasqueira e fogão a lenha
👩‍🍳Cozinha equipada com:
- Fogão industrial
- Micro-ondas
- Fogão com forno
- Geladeira
- 1 freezer vertical
- 1 freezer horizontal
🪑10 mesas plásticas e 40 cadeiras
🚗Estacionamento privado
🛁Banheiros com chuveiro
🏕️Espaço para camping
💡Gás disponível incluso
🎠Balanço para crianças
📶Wi-Fi disponível
🛏️1 quarto equipado com:
- 1 cama de casal
- 1 colchão de casal
- 1 sofá-cama
- Ventilador de teto
🛋️Redes para descanso

Tudo isso à sua disposição para garantir conforto e praticidade durante seu evento!

\n*Digite "0" para voltar ao menu.*`.trim());
    }

    if (!session && msg.body === '4') {
        sessions[msg.from] = { etapa: 'nome' };
        saveSessions();
        return client.sendMessage(msg.from, '📝 Vamos iniciar sua pré-reserva!\n\nPor favor, informe seu *nome completo*.');
    }

    if (!session && msg.body === '5') {
        return client.sendMessage(msg.from, `
📸 *Ver fotos e vídeos:*
Acesse nosso Instagram:
https://www.instagram.com/nossatocaeventos/

\n*Digite "0" para voltar ao menu.*`.trim());
    }

    if (!session && msg.body === '6') {
        return client.sendMessage(msg.from, `
👩‍💼 *Fale com um atendente:*
Um atendente será acionado em breve.
Por favor, aguarde! 😊

\n*Digite "0" para voltar ao menu.*`.trim());
    }

    if (session) {
        switch (session.etapa) {
            case 'nome':
                if (!msg.body.trim()) {
                    return client.sendMessage(msg.from, '❗ Informe um nome válido.');
                }
                session.nome = msg.body.trim();
                session.etapa = 'tipo_evento';
                saveSessions();
                return client.sendMessage(msg.from, `
Ótimo! Qual o *tipo de evento*? Selecione o número:

1 - Casamento 💍
2 - Aniversário 🎂
3 - Evento Familiar 👨‍👩‍👧‍👦
4 - Evento Corporativo 🧑‍💼`);

            case 'tipo_evento':
                const escolha = parseInt(msg.body);
                if (![1, 2, 3, 4].includes(escolha)) {
                    return client.sendMessage(msg.from, '❗ Escolha inválida. Envie um número de 1 a 4.');
                }

                const tipos = {
                    1: 'casamento',
                    2: 'aniversário',
                    3: 'evento familiar',
                    4: 'evento corporativo'
                };

                session.tipo_evento = tipos[escolha];
                session.etapa = 'data';

                if (escolha === 1) {
                    session.dias = 3;
                    saveSessions();
                    return client.sendMessage(msg.from, 'Casamentos têm locação mínima de 3 dias.\n\nPerfeito! Qual a *data do evento*? (Ex: 25/12/2025)');
                }

                saveSessions();
                return client.sendMessage(msg.from, 'Perfeito! Qual a *data do evento*? (Ex: 25/12/2025)');

            case 'data':
                const input = moment(msg.body, 'DD/MM/YYYY', true);
                if (!input.isValid() || input.isBefore(moment(), 'day')) {
                    return client.sendMessage(msg.from, '❗ Data inválida ou no passado. Ex: 25/12/2025');
                }

                const date = input.format('DD/MM/YYYY');
                if (occupiedDates.includes(date)) {
                    return client.sendMessage(msg.from, `❌ A data ${date} já está ocupada. Escolha outra.`);
                }

                session.data = date;
                saveSessions();

                if (session.tipo_evento === 'casamento') {
                    const total = session.dias * 750;
                    const entrada = total / 2;
                    delete sessions[msg.from];
                    saveSessions();
                    return client.sendMessage(msg.from, `
🎉 *Resumo da pré-reserva:*
👤 Nome: ${session.nome}
🎈 Tipo: ${session.tipo_evento}
📅 Data: ${session.data}
📆 Dias: ${session.dias}
💰 Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

✅ Nossa equipe irá confirmar a disponibilidade da data solicitada e estrará em contato o mais rápido possível. Obrigado!`.trim());
                } else {
                    session.etapa = 'dias';
                    return client.sendMessage(msg.from, 'Quantos *dias de locação* você deseja?');
                }

            case 'dias':
                const dias = parseInt(msg.body);
                if (isNaN(dias) || dias < 1) {
                    return client.sendMessage(msg.from, '❗ Informe um número válido de dias.');
                }

                session.dias = dias;
                const base = 650;
                let total = dias * base;
                if (dias > 1) total *= 0.85;
                const entrada = total / 2;

                delete sessions[msg.from];
                saveSessions();
                return client.sendMessage(msg.from, `
🎉 *Resumo da pré-reserva:*
👤 Nome: ${session.nome}
🎈 Tipo: ${session.tipo_evento}
📅 Data: ${session.data}
📆 Dias: ${session.dias}
💰 Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
🔐 Entrada: ${entrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

✅ Nossa equipe irá confirmar a disponibilidade da data solicitada e estrará em contato o mais rápido possível. Obrigado!`.trim());

            default:
                delete sessions[msg.from];
                saveSessions();
                return client.sendMessage(msg.from, '⚠️ Ocorreu um erro. Digite *menu* para recomeçar.');
        }
    }
});
