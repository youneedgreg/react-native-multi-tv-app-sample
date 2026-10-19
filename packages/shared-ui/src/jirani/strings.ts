import type { Answer } from './client';

/** The card's words in English and Spanish. Jirani's own messages are English, so Spanish uses its own. */
export const strings = {
  en: {
    title: 'Jirani is checking in',
    ask: (_name: string, message: string) => message,
    ok: "I'm OK",
    call: (family: string) => `Call ${family}`,
    sending: 'Telling Jirani…',
    reply: (_name: string, _family: string, _answer: Answer, jiraniReply: string) => jiraniReply,
    failed: "Jirani didn't get that. Please try again.",
    back: 'Back to TV in a moment. Press Back to return now.',
    footer: 'Jirani · the neighbour who notices',
  },
  es: {
    title: 'Jirani quiere saber cómo estás',
    ask: (name: string) => `Hola, ${name}. Soy Jirani. ¿Estás bien?`,
    ok: 'Estoy bien',
    call: (family: string) => `Llamar a ${family}`,
    sending: 'Avisando a Jirani…',
    reply: (name: string, family: string, answer: Answer) =>
      answer === 'ok'
        ? `Gracias, ${name}. Me alegra que estés bien.`
        : `Gracias, ${name}. Le he pedido a ${family} que te llame.`,
    failed: 'Jirani no lo recibió. Inténtalo de nuevo.',
    back: 'Volvemos a la tele en un momento. Pulsa Atrás para volver ya.',
    footer: 'Jirani · el vecino que se da cuenta',
  },
} as const;
