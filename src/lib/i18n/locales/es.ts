import type { Dictionary } from "./en";

export const es: Dictionary = {
  lang: { button: "Idioma", title: "Elige tu idioma", close: "Cerrar" },

  attract: {
    tapToPlay: "Toca para jugar",
    subtitleA: "Gira los rodillos, haz el test o atrapa el fraude.",
    subtitleB: "Todos los jugadores se llevan un premio.",
    ticker: [
      "todos ganan algo",
      "toros de peluche",
      "tarjetas regalo",
      "spinners",
      "vence a la casa",
      "aprende algo",
    ],
  },

  modes: {
    title: "Elige tu",
    titleAccent: "juego",
    back: "Atrás",
    footer: "Cada juego, cada jugador, un premio",
    play: "Jugar",
    casino: {
      kicker: "Pura suerte",
      title: "Casino",
      blurb: "Acciona la palanca de la tragaperras cb911.",
      bullets: ["Un giro, 15 segundos", "Tres toros y ganas a lo grande", "No hay que pensar"],
    },
    classroom: {
      kicker: "Pura destreza",
      title: "Aula",
      blurb: "Cinco preguntas sobre contracargos. Vence al reloj.",
      bullets: [
        "Cinco preguntas, 15 s cada una",
        "Cuatro aciertos para ganar",
        "Un pleno desbloquea el premio mayor",
      ],
    },
    catch: {
      kicker: "Puro reflejo",
      title: "Caza",
      blurb: "Detecta los pedidos fraudulentos antes de que pasen.",
      bullets: [
        "Toca los pedidos malos",
        "No toques a los buenos clientes",
        "Atrapa 7 de 10 para ganar",
      ],
    },
  },

  slots: {
    bulls: "toros",
    equalsWin: "= ¡ganas!",
    winner: "¡Ganador!",
    soClose: "Casi.",
    balance: "Saldo",
    bet: "Apuesta",
    win: "Premio",
    spin: "Girar",
    rolling: "Girando…",
    back: "Atrás",
    everySpin: "Cada giro",
    winsMerch: "gana premio",
    hiccup: "La máquina falló. Toca girar para reintentar.",
  },

  quiz: {
    title: "Desafío de",
    titleAccent: "contracargos",
    subtitle: "{pass} aciertos para ganar · {total} para el premio mayor",
    quit: "Salir",
    correct: "Correcto",
    nope: "No",
    outOfTime: "Tiempo",
    next: "Siguiente",
    seePrize: "Ver premio",
  },

  quizResults: {
    youScored: "Tu puntuación",
    jackpotUnlocked: "Premio mayor desbloqueado",
    prizeUnlocked: "Premio desbloqueado",
    everyoneWins: "Todos ganan igual",
    youSaid: "Dijiste",
    answerWas: "respuesta",
    ranOutOfTime: "Se acabó el tiempo",
    seeMyPrize: "Ver mi premio",
  },

  catch: {
    title: "Caza el",
    titleAccent: "fraude",
    subtitle: "Toca los pedidos malos · deja en paz a los buenos",
    quit: "Salir",
    caught: "Atrapados",
    missed: "Escapados",
    wronglyDeclined: "Rechazados por error",
    howTo:
      "Aparecerán pedidos con un solo dato cada uno. Toca los que huelan a fraude antes de que pasen.",
    timesUp: "Se acabó el tiempo",
    gotAway: "Se escapó",
    gotAwayDetail: "Ese se convierte en un contracargo.",
    caughtIt: "Atrapado",
    goodCustomer: "Buen cliente",
    goodCustomerDetail: "Acabas de rechazar un pedido real.",
    footer: "Atrapa {pass} de {total} para ganar · los {total} para el premio mayor",
  },

  catchResults: {
    youCaught: "Atrapaste",
    of: "de",
    jackpotUnlocked: "Premio mayor desbloqueado",
    prizeUnlocked: "Premio desbloqueado",
    everyoneWins: "Todos ganan igual",
    revenueProtected: "Ingresos protegidos",
    lostToChargebacks: "Perdido en contracargos",
    nothingGotThrough: "No se escapó nada",
    trueCost: "≈ {amount} contando comisiones y envío",
    goodCustomersLost: "Buenos clientes perdidos",
    noneDeclined: "No rechazaste ni uno",
    customersKept: "Clientes conservados",
    servedWithoutFriction: "Atendidos sin fricción",
    netPosition: "Balance neto",
    netExplain: "Los ingresos que protegiste, menos el coste real de lo que se escapó y de los pedidos buenos que rechazaste.",
    ordersStopped: "{count} pedidos fraudulentos detenidos",
    ordersDeclined: "{amount} en pedidos que rechazaste",
    gotThrough: "Se escapó",
    wasLegit: "Era legítimo",
    seeMyPrize: "Ver mi premio",
  },

  reveal: { pickAny: "Elige uno de estos en el estand", getMyCode: "Obtener mi código" },

  claim: {
    title: "Escanea para llevarte",
    titleAccent: "tu premio",
    subtitle: "Tu puntuación y tu código te esperan en el móvil — sin teclear aquí.",
    steps: [
      "Apunta la cámara al código",
      "Tu puntuación y tu premio ya están en la página",
      "Pon tu correo y el código es tuyo",
    ],
    noPhone: "¿Sin móvil? Escríbelo aquí",
    backToQr: "Volver al QR",
  },

  email: {
    title: "¿Dónde te enviamos",
    titleAccent: "tu código?",
    wonLine: "Tienes un {label} esperando — el código es tu vale en el estand.",
    loseLine: "Tu premio te espera en el estand. El código es tu vale.",
    placeholder: "tu@empresa.com",
    consent:
      "Quiero recibir consejos sobre contracargos y novedades de Chargebacks911. Opcional — recibes tu código igualmente.",
    skip: "Sin correo — solo muéstralo",
    getMyCode: "Obtener mi código",
    sending: "Enviando…",
    clear: "Borrar",
    invalid: "Eso no parece un correo",
  },

  code: {
    showAtBooth: "Muestra esto en el",
    booth: "estand",
    prizeCode: "Código de premio",
    eligible: "Puedes elegir uno de estos",
    emailSent: "Ya va una copia a tu bandeja de entrada.",
    emailPending: "Haz una foto de esta pantalla — el correo puede tardar un minuto.",
    skipped: "Apúntalo o haz una foto — este no lo hemos enviado por correo.",
    done: "Listo — siguiente jugador",
    resetting: "Reiniciando en {seconds} s",
  },

  trouble: {
    title: "Habla con un",
    titleAccent: "representante",
    body: "La central de premios no responde, así que no podemos emitir tu código. Has ganado igual — díselo a cualquiera del estand de Chargebacks911 y te ayudarán.",
    tryAgain: "Reintentar",
    startOver: "Empezar de nuevo",
  },

  common: {
    home: "Inicio",
    grading: "Consultando el estante de premios…",
    tallying: "Contando tu puntuación…",
  },

  tiers: {
    grand: { label: "PREMIO MAYOR", blurb: "Eso no lo hace nadie. Ve a recogerlo." },
    plush: { label: "GRAN PREMIO", blurb: "El estante bueno. Tú eliges." },
    spinner: { label: "GANADOR", blurb: "Gira mejor que un ciclo de contracargos." },
    consolation: { label: "BUEN INTENTO", blurb: "La casa siempre gana. Aun así te llevas algo." },
  },

  prizes: {
    "$25 gift card": "Tarjeta regalo de 25 $",
    "cb911 hoodie": "Sudadera cb911",
    "Premium plush bull": "Toro de peluche premium",
    "Plush bull": "Toro de peluche",
    "Insulated tumbler": "Vaso térmico",
    "Wireless charger": "Cargador inalámbrico",
    "cb911 fidget spinner": "Spinner cb911",
    "Enamel pin set": "Set de pines esmaltados",
    "Phone stand": "Soporte para móvil",
    "Sticker pack": "Pack de pegatinas",
    Koozie: "Funda para latas",
    "Pen + notepad": "Bolígrafo y libreta",
  },

  questions: {
    "q-what": {
      prompt: "¿Qué es un contracargo?",
      options: [
        "Un reembolso que emite el comercio",
        "Una reversión forzosa del pago por el banco del titular",
        "Una comisión por pago tardío",
        "Un descuento para clientes habituales",
      ],
      explain:
        "El banco saca el dinero de la cuenta del comercio. El comercio no opina hasta que ya se lo han quitado.",
    },
    "q-friendly": {
      prompt: "¿Qué es el «fraude amistoso»?",
      options: [
        "Un fraude cometido por un amigo",
        "Una tarjeta robada usada en un pequeño comercio",
        "Un titular real que disputa una compra que sí hizo",
        "Un error bancario reembolsado automáticamente",
      ],
      explain:
        "No tiene nada de amistoso. El cliente recibió el producto y aun así disputó el cargo — y es la mayor parte del problema.",
    },
    "q-share": {
      prompt: "¿Qué proporción de los contracargos es fraude amistoso, aproximadamente?",
      options: ["Menos del 10 %", "Cerca del 25 %", "La mayoría", "Prácticamente ninguno"],
      explain:
        "Las estimaciones del sector sitúan el fraude amistoso en la mayoría de las disputas — mucho más que el robo de tarjetas.",
    },
    "q-window": {
      prompt: "¿Cuánto tiempo suele tener un titular para disputar un cargo?",
      options: ["24 horas", "30 días", "120 días", "7 años"],
      explain:
        "120 días desde la transacción es lo habitual, y algunos códigos lo amplían. Esa venta no es definitiva en meses.",
    },
    "q-cost": {
      prompt: "Una venta de 100 $ recibe un contracargo. ¿Cuánto te cuesta de verdad?",
      options: ["100 $", "100 $ más una comisión", "De dos a tres veces el importe", "Nada si ganas"],
      explain:
        "Producto perdido, venta perdida, la comisión, el envío, el tiempo del personal. El coste real se multiplica rápido.",
    },
    "q-fee": {
      prompt: "Peleas un contracargo y ganas. ¿Te devuelven la comisión?",
      options: [
        "Sí, siempre",
        "Normalmente no — la comisión se pierde igual",
        "Sí, el doble",
        "Solo con Amex",
      ],
      explain:
        "Ganar recupera tus ingresos. La comisión casi nunca vuelve, por eso prevenir es mejor que pelear.",
    },
    "q-ratio": {
      prompt: "¿Con qué ratio de contracargos entra un comercio en un programa de vigilancia?",
      options: ["0,9 %", "5 %", "12 %", "25 %"],
      explain:
        "Menos del uno por ciento. Si lo superas entras en un programa de vigilancia con multas — y puedes acabar sin poder aceptar tarjetas.",
    },
    "q-representment": {
      prompt: "¿Qué es una «representación» (representment)?",
      options: [
        "Contratar a un abogado",
        "Reenviar la transacción con pruebas para pelear la disputa",
        "Un segundo cargo al cliente",
        "Cambiar de procesador de pagos",
      ],
      explain:
        "Vuelves a presentar la venta al emisor con pruebas sólidas: prueba de entrega, registros de acceso, coincidencia AVS, condiciones aceptadas.",
    },
    "q-descriptor": {
      prompt: "¿La mejor solución para las disputas de «no reconozco este cargo»?",
      options: [
        "Bajar los precios",
        "Un descriptor de facturación claro con tu marca real",
        "Enviar más rápido",
        "Dejar de aceptar tarjetas",
      ],
      explain:
        "Muchísimas disputas son solo confusión en el extracto. Pon un nombre reconocible y un teléfono en el descriptor.",
    },
    "q-3ds": {
      prompt: "¿Qué hace 3-D Secure por un comercio?",
      options: [
        "Acelera el pago",
        "Traslada la responsabilidad del fraude al emisor",
        "Elimina las comisiones",
        "Bloquea los reembolsos",
      ],
      explain:
        "En una transacción autenticada con 3DS, un contracargo por fraude suele pasar a ser problema del emisor, no tuyo.",
    },
    "q-double": {
      prompt: "Ya reembolsaste al cliente. ¿Puede aun así presentar un contracargo?",
      options: [
        "No, el reembolso lo impide",
        "Sí — y puedes acabar pagando dos veces",
        "Solo después de un año",
        "Solo con productos digitales",
      ],
      explain:
        "Se llama doble cobro. Si no respondes con la prueba del reembolso, pagas la venta dos veces.",
    },
    "q-reason": {
      prompt: "¿Qué es un «código de motivo» de contracargo?",
      options: [
        "La explicación escrita del cliente",
        "La categoría del emisor sobre por qué se presentó la disputa",
        "Tu número de cuenta de comercio",
        "Un código de descuento",
      ],
      explain:
        "El código te dice exactamente qué prueba gana. Pelear el código equivocado con la prueba equivocada pierde un caso ganable.",
    },
    "q-deflect": {
      prompt: "¿Qué es la desviación previa a la disputa?",
      options: [
        "Bloquear clientes de riesgo al pagar",
        "Enviar los datos de la transacción al banco para que la disputa nunca se abra",
        "Reembolsar a todo el que se queje",
        "Recurrir después de perder",
      ],
      explain:
        "Las herramientas de las redes envían los datos del pedido a la app del banco durante la queja. El cliente ve qué compró y lo deja.",
    },
    "q-evidence": {
      prompt: "¿Cuál es la prueba más fuerte en una disputa de «artículo no recibido»?",
      options: [
        "Una captura de tu política de devoluciones",
        "Confirmación de entrega firmada en la dirección de facturación",
        "El correo del cliente",
        "Las buenas reseñas de tu empresa",
      ],
      explain:
        "La confirmación de entrega vinculada a la dirección de facturación verificada es casi imbatible en un caso de no recepción.",
    },
  },

  cards: {
    "Luxe Watches": "Primer pedido · envío exprés",
    "GameKeys Direct": "9 tarjetas probadas en 4 minutos",
    "Nova Electronics": "AVS no coincide · CVV fallido",
    "Gift Card Hub": "Cantidad máxima · 2:41 h",
    "Sneaker Vault": "Envío a un reexpedidor",
    "Peak Outdoor": "Correo creado hace 6 minutos",
    "Audio Lab": "12 rechazos y luego aprobado",
    "Metro Phones": "Mismo dispositivo · 7 cuentas",
    "Bright Beauty": "Nombre de la tarjeta ≠ nombre de la cuenta",
    "Trail Bikes": "40 veces el pedido medio de la tienda",
    "Cloud Credits": "Dispositivo nuevo en un nodo VPN",
    "Fine Jewelry Co": "Facturación y envío a 3 estados de distancia",
    "Corner Coffee": "AVS y CVV coinciden · cliente habitual",
    "Hartley Books": "Misma tarjeta, misma dirección, 3 años",
    "Fresh Grocer": "Coincide con sus últimos 6 pedidos",
    "Sunset Yoga": "Renovación de suscripción · mes 14",
    "Ridge Hardware": "Verificado con 3-D Secure",
    "Delta Supply": "Tarjeta corporativa · BIN conocido",
    "Pine Pharmacy": "Sesión iniciada · tarjeta guardada · mediodía",
    "Harbor Diner": "Recogida local · DNI registrado",
    "Vista Optics": "Envío en dos días al domicilio",
    "Studio Paints": "Cesta media de esta tienda",
  },

  phone: {
    scoredQuiz: "Sacaste {score}/{total} en el Desafío de contracargos",
    caughtFraud: "Atrapaste {score} de {total} pedidos fraudulentos",
    beatSlots: "Venciste a la tragaperras",
    playedSlots: "Jugaste a la tragaperras",
    eligible: "Puedes elegir uno de estos en el estand",
    emailLabel: "Correo electrónico",
    getMyCode: "Obtener mi código",
    sending: "Enviando…",
    prizeCode: "Código de premio",
    withEmail:
      "Tienes una copia en tu correo. Muestra esta pantalla en el estand de Chargebacks911 para elegir tu premio.",
    withoutEmail:
      "Haz una captura. Muéstrala en el estand de Chargebacks911 para elegir tu premio.",
    expiredTitle: "Enlace caducado",
    expiredBody:
      "No encontramos esa partida. Habla con cualquiera del estand de Chargebacks911 y te ayudarán.",
    problem: "Algo salió mal. Pregunta a un representante del estand.",
    offline: "Sin conexión. Pregunta a un representante del estand.",
  },
};
