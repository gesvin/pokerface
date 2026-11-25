export type QuestionCategory = "ijsbreker" | "gevaarlijk";

export type SupportedLanguage = "nl" | "en" | "es";

export interface QuestionItem {
  id: string;
  category: QuestionCategory;
  nl: string;
  en: string;
  es: string;
}

export const QUESTIONS: QuestionItem[] = [
  {
    id: "q01",
    category: "ijsbreker",
    nl: "Wat is de meest onzinnige reden waarom je ooit een Tikkie hebt gestuurd?",
    en: "What is the most ridiculous reason you've ever sent a payment request or Tikkie?",
    es: "¿Cuál es la razón más absurda por la que alguna vez has pedido dinero o mandado un bizum/Tikkie?",
  },
  {
    id: "q02",
    category: "ijsbreker",
    nl: "Welke populaire serie, film of artiest vind je stiekem compleet overschat?",
    en: "Which popular show, movie, or artist do you secretly think is completely overrated?",
    es: "¿Qué serie, película o artista popular te parece en secreto completamente sobrevalorado?",
  },
  {
    id: "q03",
    category: "ijsbreker",
    nl: "Wat is het slechtste advies dat je ooit aan een vriend hebt gegeven?",
    en: "What is the worst piece of advice you've ever given a friend?",
    es: "¿Cuál es el peor consejo que le has dado alguna vez a un amigo?",
  },
  {
    id: "q04",
    category: "ijsbreker",
    nl: "Hoe lang deed je erover om vandaag te bedenken wat je aan zou trekken?",
    en: "How long did it take you today to decide what to wear?",
    es: "¿Cuánto tardaste hoy en decidir qué ponerte?",
  },
  {
    id: "q05",
    category: "ijsbreker",
    nl: "Wat is het gekste eten dat je lekker vindt, maar anderen raar vinden?",
    en: "What's the weirdest food combination you love that others find strange?",
    es: "¿Cuál es la mezcla de comida más rara que te encanta y que a los demás les parece un crimen?",
  },
  {
    id: "q06",
    category: "ijsbreker",
    nl: "Welk compliment krijg je vaker dan je eigenlijk zelf gelooft?",
    en: "What compliment do you get more often than you actually believe yourself?",
    es: "¿Qué cumplido recibes más veces de las que realmente te crees?",
  },
  {
    id: "q07",
    category: "ijsbreker",
    nl: "Wat is de vreemdste plek waar je ooit in slaap bent gevallen?",
    en: "What's the strangest place you've ever fallen asleep?",
    es: "¿Cuál es el lugar más raro en el que te has quedado dormido alguna vez?",
  },
  {
    id: "q08",
    category: "ijsbreker",
    nl: "Welke slechte gewoonte heb je overgenomen van iemand in deze groep?",
    en: "What bad habit did you pick up from someone in this group?",
    es: "¿Qué mala costumbre se te ha pegado de alguien de este grupo?",
  },
  {
    id: "q09",
    category: "ijsbreker",
    nl: "Wat is het meest kinderachtige waar je nog steeds boos of jaloers om kunt worden?",
    en: "What's the most childish thing that can still make you annoyed or jealous?",
    es: "¿Qué tontería infantil todavía consigue picarte o darte celos?",
  },
  {
    id: "q10",
    category: "ijsbreker",
    nl: "Als je morgen één dag een andere baan of studie moest doen, wat kies je?",
    en: "If you had to do a different job or study for one day tomorrow, what would you pick?",
    es: "Si mañana tuvieras que hacer un trabajo o carrera distinta por un día, ¿cuál elegirías?",
  },
  {
    id: "q11",
    category: "ijsbreker",
    nl: "Wat is de meest onhandige autocorrect-fout die je ooit hebt verstuurd?",
    en: "What's the most awkward autocorrect typo you've ever sent?",
    es: "¿Cuál es el fallo del autocorrector más comprometedor que has mandado por error?",
  },
  {
    id: "q12",
    category: "ijsbreker",
    nl: "Welke regel breek je bijna elke week zonder erbij na te denken?",
    en: "What minor rule do you break almost every week without thinking?",
    es: "¿Qué pequeña regla te saltas casi todas las semanas sin pensarlo?",
  },
  {
    id: "q13",
    category: "gevaarlijk",
    nl: "Wat is de meest gênante smoes waarmee je ooit onder een afspraak of feestje bent uitgekomen?",
    en: "What's the most embarrassing excuse you've used to skip a plan or party?",
    es: "¿Cuál es la excusa más vergonzosa con la que te has escaqueado de un plan o fiesta?",
  },
  {
    id: "q14",
    category: "gevaarlijk",
    nl: "Welke overdreven smoes heb je verzonnen toen iemand je vroeg waarom je urenlang niet reageerde op een appje?",
    en: "What over-the-top excuse did you make up when someone asked why you ignored their text for hours?",
    es: "¿Qué excusa exagerada te inventaste cuando alguien te preguntó por qué dejaste su mensaje en visto durante horas?",
  },
  {
    id: "q15",
    category: "gevaarlijk",
    nl: "Wat is het duurste ding dat je per ongeluk hebt gesloopt of kwijtgeraakt?",
    en: "What's the most expensive thing you've accidentally broken or lost?",
    es: "¿Qué es lo más caro que has roto o perdido por accidente?",
  },
  {
    id: "q16",
    category: "gevaarlijk",
    nl: "Welke gewoonte van jou zou je huisgenoot of beste vriend meteen verbieden?",
    en: "Which habit of yours would your roommate or best friend ban immediately?",
    es: "¿Qué manía tuya prohibiría al instante tu compañero de piso o mejor amigo?",
  },
  {
    id: "q17",
    category: "gevaarlijk",
    nl: "Wat is de grootste leugen die je ooit hebt verteld om niet in de problemen te komen?",
    en: "What's the biggest lie you told to stay out of trouble?",
    es: "¿Cuál es la mentira más grande que has soltado para librarte de un lío?",
  },
  {
    id: "q18",
    category: "gevaarlijk",
    nl: "Hoe liep het af de keer dat er iets misging en iemand anders de schuld kreeg terwijl jij rustig je mond hield?",
    en: "How did it play out the time something went wrong and someone else took the blame while you stayed quiet?",
    es: "¿Cómo acabó la vez que algo salió mal y otro se llevó la bronca mientras tú te quedabas callado?",
  },
  {
    id: "q19",
    category: "gevaarlijk",
    nl: "Wat is de meest beschamende reden waarom je ooit te laat was op werk, school of een date?",
    en: "What's the most embarrassing reason you were late for work, class, or a date?",
    es: "¿Cuál es el motivo más bochornoso por el que llegaste tarde al curro, a clase o a una cita?",
  },
  {
    id: "q20",
    category: "gevaarlijk",
    nl: "Welke app op je telefoon zou je het liefst verbergen als iemand je scherm overneemt?",
    en: "Which app on your phone would you least want someone to open right now?",
    es: "¿Qué app de tu móvil preferirías ocultar si alguien te quitara el teléfono ahora mismo?",
  },
  {
    id: "q21",
    category: "gevaarlijk",
    nl: "Heb je ooit ergens voor betaald of iets gekregen en gedaan alsof je het zelf had gemaakt?",
    en: "Have you ever taken credit for something or pretended you put in way more effort than you did?",
    es: "¿Alguna vez te colgaste una medalla o fingiste haberte currado algo mucho más de lo que hiciste?",
  },
  {
    id: "q22",
    category: "gevaarlijk",
    nl: "Welke belachelijke belofte of plan maakte jij 's nachts na een paar drankjes waar je de volgende ochtend spijt van had?",
    en: "What ridiculous promise or plan did you make late at night after a few drinks that you regretted the next morning?",
    es: "¿Qué plan absurdo o promesa imposible hiciste de madrugada tras unas copas del que te arrepentiste al día siguiente?",
  },
  {
    id: "q23",
    category: "gevaarlijk",
    nl: "Welke mening heb je over iemand in deze groep die je nog nooit hardop hebt gezegd?",
    en: "What's a harmless-ish opinion you have about someone here that you haven't said out loud?",
    es: "¿Qué opinión más o menos inocente tienes sobre alguien de aquí que nunca has dicho en voz alta?",
  },
  {
    id: "q24",
    category: "gevaarlijk",
    nl: "Wat is de meest gênante situatie waarin je per ongeluk bent beland op een feestje?",
    en: "What's the most awkward situation you've accidentally walked into at a party?",
    es: "¿En qué situación más incómoda te has metido sin querer en una fiesta?",
  },
];