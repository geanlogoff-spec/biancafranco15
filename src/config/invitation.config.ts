/**
 * ============================================================
 *  ARQUIVO ÚNICO DE PERSONALIZAÇÃO DO CONVITE
 *  Altere apenas este arquivo (e as imagens/música em /public)
 *  para reutilizar o convite em outra festa.
 * ============================================================
 */

export interface GiftHintCategory {
  id: 'shoes' | 'clothes' | 'beauty' | 'accessories' | 'teen';
  title: string;
  description: string;
  items: string[];
}

export interface InvitationConfig {
  debutante: {
    /** Nome exibido em letra cursiva */
    name: string;
    /** Caminho da imagem em /public (foto real ou ilustração) */
    photo: string;
    photoAlt: string;
  };
  event: {
    /** Data/hora no formato ISO com fuso horário local do evento */
    dateISO: string;
    /** Fuso IANA do local do evento (usado para formatar data/hora) */
    timeZone: string;
  };
  venue: {
    /** Nome do salão/espaço. Deixe vazio se não houver um nome. */
    name: string;
    address: string;
    district: string;
    city: string;
    state: string;
    zip: string;
    /** Link "Como chegar" (Google Maps) */
    mapsLink: string;
    /** Texto usado para posicionar o marcador no mapa incorporado */
    mapsQuery: string;
  };
  rsvp: {
    /** WhatsApp com DDI+DDD, só números (ex: 5568999999999). Vazio = oculta botão do WhatsApp */
    whatsappNumber: string;
    allowCompanions: boolean;
    maxCompanions: number;
    /** Tabela dedicada no Supabase */
    supabaseTable: string;
  };
  audio: {
    /** Caminho do .mp3 em /public. Vazio = oculta o controle de música */
    musicUrl: string;
    title: string;
  };
  texts: {
    portal: string;
    portalButton: string;
    debutanteQuote: string;
    invitation: string[];
    rsvpTitle: string;
    closing: string;
  };
  giftHints: {
    eyebrow: string;
    title: string;
    subtitle: string;
    footerNote: string;
    categories: GiftHintCategory[];
  };
}

export const invitation: InvitationConfig = {
  debutante: {
    name: 'Bianca Franco',
    photo: '/images/princesa.jpg',
    photoAlt: 'Ilustração de princesa representando a debutante',
  },
  event: {
    dateISO: '2027-01-15T19:30:00-05:00', // Acre (UTC-5)
    timeZone: 'America/Rio_Branco',
  },
  venue: {
    name: '',
    address: 'R. do Amazonas, 2225',
    district: 'São José',
    city: 'Cruzeiro do Sul',
    state: 'AC',
    zip: '69980-000',
    mapsLink: 'https://maps.app.goo.gl/c8gyLdGMQLSDT1A66',
    mapsQuery: 'R. do Amazonas, 2225 - São José, Cruzeiro do Sul - AC, 69980-000',
  },
  rsvp: {
    whatsappNumber: '',
    allowCompanions: false,
    maxCompanions: 0,
    supabaseTable: 'rsvps_bianca15',
  },
  audio: {
    musicUrl: '',
    title: 'Música ambiente',
  },
  texts: {
    portal: 'Você está prestes a entrar em um sonho...',
    portalButton: 'ABRIR MEU CONVITE',
    debutanteQuote: 'Existem momentos que florescem para sempre em nossos corações...',
    invitation: [
      'Com muita alegria, convido você para celebrar comigo um dos momentos mais especiais da minha vida: meus 15 anos!',
      'Será uma noite de sonhos, emoções e momentos inesquecíveis. E quero ter você comigo para tornar essa história ainda mais bonita.',
    ],
    rsvpTitle: 'Sua presença fará parte desse sonho!',
    closing: 'Estou contando os dias para viver essa noite mágica com você!',
  },
  giftHints: {
    eyebrow: 'Caso alguma fada madrinha pergunte...',
    title: 'Pistas da Fada Madrinha',
    subtitle:
      'A sua presença já é o meu maior presente! Mas, se o seu coração insistir muito em me mimar e bater aquela dúvida na loja, deixei algumas pistas "totalmente por acaso" aqui embaixo:',
    footerNote: 'PS: Prometo fazer cara de surpresa mesmo sabendo que você consultou esta colinha oficial! 😉✨',
    categories: [
      {
        id: 'shoes',
        title: 'Sapatinho de Cristal',
        description: 'Diferente da Cinderela, eu não costumo perder o pé pela escada — mas já aviso o número oficial de calçados, sapatos e sandálias:',
        items: ['Nº 37'],
      },
      {
        id: 'clothes',
        title: 'Guarda-Roupa Real',
        description: 'Se a missão envolver um look novo para o meu reino (e evitar trocas depois do baile), anote as medidas mágicas:',
        items: ['Blusas: M', 'Calça: 36', 'Vestidos: M ou Único'],
      },
      {
        id: 'beauty',
        title: 'Poções de Beleza',
        description: 'Tudo o que deixa qualquer princesa ainda mais perfumada, hidratada e com o cabelo brilhando como conto de fadas:',
        items: ['Perfumes', 'Hidratantes', 'Kits para Cabelo', 'Make & Skincare'],
      },
      {
        id: 'accessories',
        title: 'Joias da Coroa',
        description: 'Pequenos detalhes brilhantes que combinam com todos os capítulos dos meus 15 anos:',
        items: ['Pulseiras', 'Anéis', 'Cordões', 'Relógios', 'Bolsas'],
      },
      {
        id: 'teen',
        title: 'Universo 15 Anos',
        description: 'E para completar o encanto de uma adolescente de 15 anos cheia de sonhos e estilo:',
        items: ['Acessórios Teen', 'Fones / Tech', 'Livros & Papelaria', 'Vale-Presente'],
      },
    ],
  },
};
