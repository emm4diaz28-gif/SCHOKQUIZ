// Sistema de niveles
const LEVELS = [
  { name: 'BRONCE',   emoji: '🥉', min: 0,    max: 1620  },
  { name: 'PLATA',    emoji: '🥈', min: 1620,  max: 3500  },
  { name: 'ORO',      emoji: '🥇', min: 3500,  max: 6000  },
  { name: 'PLATINO',  emoji: '💎', min: 6000,  max: 99999 }
];

const QUESTIONS = {
  'Historia del Francés': [
    {
      q: '¿Cuál es el nombre que los romanos le dieron a los territorios donde habitaban los galos celtas e incluida la actual Francia?',
      opts: ['La Galia', 'La Celia', 'Paris', 'Ninguna de las anteriores'],
      ans: 0, diff: 'Básico', emoji: '🔋',
      exp: 'El capacitor almacena energía en forma de campo eléctrico entre sus placas conductoras.',
      detail: 'Un capacitor (o condensador) está formado por dos placas conductoras separadas por un material dieléctrico. Cuando se aplica voltaje, se acumula carga eléctrica en las placas creando un campo eléctrico. La energía almacenada es E = ½CV². Se utiliza en filtros, fuentes de poder, osciladores y muchas aplicaciones de electrónica analógica y digital.'
    },
    {
      q: '¿Cuál es la función principal de un diodo bipolar?',
      opts: ['Amplificar señales', 'Almacenar carga', 'Permitir flujo en un solo sentido', 'Limitar corriente'],
      ans: 2, diff: 'Básico', emoji: '🔌',
      exp: 'El diodo permite el paso de corriente únicamente en dirección de polarización directa.',
      detail: 'El diodo rectificador es un semiconductor de unión P-N que conduce corriente cuando está polarizado en directa (ánodo positivo respecto al cátodo) y la bloquea en polarización inversa. En los rectificadores de fuentes de poder, convierte la corriente alterna (CA) en corriente directa (CD), siendo fundamental en adaptadores y fuentes de alimentación.'
    },
    {
      q: 'En un amplificador operacional ideal, ¿cuál es la impedancia de entrada?',
      opts: ['Cero', 'Finita (1 MΩ)', 'Infinita', 'Igual a la carga'],
      ans: 2, diff: 'Intermedio', emoji: '📡',
      exp: 'El opamp ideal tiene impedancia de entrada infinita, sin consumir corriente en sus terminales.',
      detail: 'El amplificador operacional (opamp) ideal tiene tres características clave: ganancia de voltaje infinita en lazo abierto, impedancia de entrada infinita (no consume corriente), e impedancia de salida cero. En la práctica, opamps reales como el LM741 tienen impedancias de entrada del orden de 1 MΩ a 1 TΩ (en tecnología FET). Esto es esencial para no cargar el circuito fuente.'
    },
    {
      q: '¿Qué tipo de filtro deja pasar frecuencias por encima de su frecuencia de corte?',
      opts: ['Pasa-bajas', 'Pasa-altas', 'Pasa-banda', 'Rechaza-banda'],
      ans: 1, diff: 'Intermedio', emoji: '📶',
      exp: 'El filtro pasa-altas atenúa las bajas frecuencias y deja pasar las que están sobre la frecuencia de corte.',
      detail: 'Un filtro pasa-altas (HPF) atenúa señales por debajo de su frecuencia de corte fc y permite pasar las frecuencias superiores. El más simple es un circuito RC en serie donde la salida se toma sobre la resistencia. La frecuencia de corte es fc = 1/(2πRC). Se usa para eliminar componentes DC o bajas frecuencias no deseadas, en ecualizadores de audio y comunicaciones.'
    },
    {
      q: '¿Qué ley establece que la suma de voltajes en una malla cerrada es cero?',
      opts: ['Ley de Ohm', 'KCL de Kirchhoff', 'KVL de Kirchhoff', 'Ley de Faraday'],
      ans: 2, diff: 'Básico', emoji: '⚡',
      exp: 'La KVL (Kirchhoff Voltage Law) dice que la suma algebraica de voltajes en una malla cerrada es cero.',
      detail: 'La Ley de Voltajes de Kirchhoff (KVL) es una consecuencia de la conservación de la energía. Al recorrer cualquier trayectoria cerrada en un circuito, la suma algebraica de todas las caídas y subidas de voltaje es igual a cero: ΣV = 0. Es fundamental para el análisis de mallas en circuitos eléctricos y electrónicos complejos.'
    }
  ],
  'Tipología y Distribución': [
    {
      q: '¿Cuál palabra dividio a Fancia Norte de Francia Sur?',
      opts: ['Bonju = Hola', 'Oil = Si', 'Merci = Gracias', 'Pardon = Perdon'],
      ans: 1, diff: 'Básico', emoji: '🤖',
      exp: 'Cada articulación rotacional contribuye con 1 grado de libertad, sumando 6 en total.',
      detail: 'Los Grados de Libertad (GDL o DOF) de un robot determinan cuántos movimientos independientes puede realizar. Cada articulación rotacional (revoluta) o prismática aporta 1 GDL. Un robot de 6 GDL puede alcanzar cualquier posición y orientación dentro de su espacio de trabajo, lo que lo hace muy versátil. Robots industriales como el KUKA KR 6 o el ABB IRB 120 tienen 6 GDL.'
    },
    {
      q: '¿Qué Lengua Francésa no se parece a ninguna otra en todo el mundo?',
      opts: ['Corso', 'Catalan', 'Frances Estandar', 'Euskera'],
      ans: 3, diff: 'Intermedio', emoji: '📐',
      exp: 'El encoder incremental genera pulsos por cada incremento de ángulo.',
      detail: 'El encoder incremental es un transductor de posición angular que genera trenes de pulsos eléctricos proporcionales al desplazamiento angular. Usa un disco con ranuras y un sensor óptico (o magnético). Al contar los pulsos se determina la posición relativa. Los encoders de cuadratura tienen dos canales (A y B) desfasados 90° para detectar también el sentido de giro. Resoluciones típicas: 100 a 10,000 pulsos/revolución.'
    },
    {
      q: '¿En ultramar, los ciudadanos viven una constante doble vida lingüística; a esto se le llama?',
      opts: ['El fenómeno de la diglosia.', 'Servo hidráulico', 'Motor DC', 'Actuador piezoeléctrico'],
      ans: 0, diff: 'Básico', emoji: '⚙️',
      exp: 'El motor DC convierte energía eléctrica en mecánica rotacional mediante el campo magnético.',
      detail: 'El motor de corriente continua (DC) funciona por la interacción entre el campo magnético del estátor (imanes permanentes o electroimanes) y la corriente que circula por el rotor (armadura). La fuerza de Lorentz (F = BIL) genera el torque. El sentido de giro se controla invirtiendo la polaridad. Los motores DC con escobillas son simples pero requieren mantenimiento; los brushless (BLDC) son más eficientes y durables.'
    }
  ],
  'Sociolingüística': [
    {
      q: '¿Por qué el acento parisino terminó convirtiéndose en el estándar del francés?',
      opts: ['Porque la región de París contaba con las mejores escuelas públicas desde la época romana', ' Porque desde la Edad Media la variedad de París adquirió gran prestigio al ser el centro del poder real, administrativo y cultural, consolidándose después con la centralización y la escuela pública.', ' Porque las demás lenguas y dialectos de Francia fueron prohibidos por decreto real en el siglo XII.', ' Porque fonéticamente era el único idioma de Francia que no tenía letras mudas'],
      ans: 1, diff: 'Básico', emoji: '🛡️',
      exp: 'El fusible interrumpe el circuito cuando la corriente excede su valor nominal.',
      detail: 'El fusible es el dispositivo de protección más simple: un filamento conductor de aleación que se funde cuando la corriente supera su valor nominal, abriendo el circuito. Son de un solo uso (no rearmables). Existen fusibles de acción rápida (para proteger semiconductores), lentos (toleran sobrecargas breves de arranque de motores) y de alta ruptura (para instalaciones industriales). Se especifican por corriente nominal (A) y tensión máxima (V).'
    },
    {
      q: ' ¿Cómo influyó el francés antiguo en otros idiomas como el inglés?',
      opts: ['No tuvo ningún impacto significativo, ya que el inglés evolucionó de forma completamente aislada en la isla británica.', 'Afectó únicamente a la gramática y a la estructura de los tiempos verbales, dejando intacto el vocabulario nativo.', ' Tras la conquista normanda, el inglés incorporó miles de palabras francesas, especialmente en ámbitos como la administración, la moda y la cocina', 'Sirvió exclusivamente para crear apodos y expresiones informales entre la realeza medieval.'],
      ans: 2, diff: 'Básico', emoji: '🔧',
      exp: 'El contactor permite abrir o cerrar un circuito de fuerza de manera remota mediante una bobina.',
      detail: 'El contactor es un interruptor electromagnético controlado por una bobina de baja potencia. Al energizar la bobina, un núcleo ferromagnético se desplaza y cierra los contactos principales del circuito de fuerza (donde circula la corriente de carga). Tiene contactos auxiliares para el circuito de control y señalización. Se especifica por: tensión de bobina (24V DC, 110V AC, 220V AC), corriente nominal de contactos y categoría de empleo (AC-1, AC-3 para motores).'
    },
    {
      q: '¿Qué es exactamente el verlan y de dónde sale?',
      opts: [' Es el nombre oficial del dialecto antiguo que se hablaba en los castillos del Valle del Loira.', ' Es un tipo de escritura jeroglífica utilizada por los poetas franceses del siglo XIX', 'Es un fenómeno urbano de inversión o modificación de sílabas característico del habla de las periferias (banlieues), popularizado a través de la música, el cine y la cultura urbana.', 'Es una lengua indígena originaria de las antiguas colonias francesas en el norte de África.'],
      ans: 2, diff: 'Intermedio', emoji: '💻',
      exp: 'El lenguaje Ladder imita los diagramas de relés eléctricos y es el más extendido en PLCs industriales.',
      detail: 'El lenguaje Ladder (Diagrama de Escalera o LD) está definido en la norma IEC 61131-3. Simula visualmente los diagramas de contactos de relés: los contactos normalmente abiertos (NA) y cerrados (NC) se disponen en "escalones" (rungs) entre dos rieles de alimentación. Es el más intuitivo para técnicos electricistas. Otros lenguajes IEC 61131-3: FBD (bloques de función), ST (texto estructurado, similar a Pascal), IL (lista de instrucciones) y SFC (diagrama secuencial).'
    }
  ],
  'Conservación y educación': [
    {
      q: '¿Qué tipo de lengua es el euskera o vasco y qué la hace tan especial según el mosaico lingüístico?',
      opts: ['Aaa', 'Mecatrónica', 'Robótica', 'Telemática'],
      ans: 1, diff: 'Básico', emoji: '🛠️',
      exp: 'Mecatrónica integra diseño mecánico, electrónica, control e informática para crear sistemas inteligentes.',
      detail: 'El término "Mecatrónica" fue acuñado en Japón en 1969 por Tetsuro Mori de Yaskawa Electric. Combina: Mecánica (diseño de estructuras, mecanismos, transmisiones), Electrónica (sensores, actuadores, circuitos de potencia), Informática (microcontroladores, PLC, software de control) y Control automático (sistemas realimentados, PID, control moderno). Ejemplos: máquinas CNC, robots industriales, vehículos autónomos, impresoras 3D, lavadoras modernas.'
    },
    {
      q: 'En el año 1539, ¿qué decretó el rey Francisco I de Francia mediante la Ordenanza de Villers-Cotterêts que dio un gran golpe a las lenguas regionales?',
      opts: ['Procesar señales de sensor', 'Alimentar y controlar un actuador', 'Almacenar datos del proceso', 'Comunicar módulos remotos'],
      ans: 1, diff: 'Intermedio', emoji: '🔩',
      exp: 'El driver acondiciona y amplifica la señal de control para alimentar correctamente el actuador.',
      detail: 'Un driver (o controlador de potencia) es la interfaz entre el controlador (microcontrolador, PLC) y el actuador (motor, válvula). El controlador genera señales de baja potencia (5V, 3.3V) que el driver convierte en señales de potencia adecuadas para el actuador. Ejemplos: driver L298N para motores DC (puente H), driver DRV8825 para motores paso a paso, driver IGBT para inversores trifásicos. Incluye protecciones contra sobrecorriente, sobretensión y temperatura.'
    }
  ],
  'Equipos ': [
    {
      q: '¿Qué instrumento visualiza la forma de onda de una señal eléctrica en el tiempo?',
      opts: ['Multímetro', 'Analizador de espectro', 'Osciloscopio', 'Pinza amperimétrica'],
      ans: 2, diff: 'Básico', emoji: '📊',
      exp: 'El osciloscopio muestra la variación del voltaje en función del tiempo, permitiendo analizar formas de onda.',
      detail: 'El osciloscopio es el instrumento más versátil en electrónica. Muestra gráficamente la variación del voltaje vs. tiempo. Sus parámetros clave son: ancho de banda (MHz/GHz), frecuencia de muestreo (Sa/s) y profundidad de memoria. Permite medir: amplitud, frecuencia, período, ciclo de trabajo, tiempo de subida, desfase entre señales y realizar mediciones FFT. Los osciloscopios modernos digitales de almacenamiento (DSO) pueden guardar y analizar señales.'
    },
    {
      q: '¿Qué mide la función de "continuidad" de un multímetro?',
      opts: ['Resistencia en ohmios exacta', 'Si hay un camino conductor cerrado', 'Voltaje AC presente', 'Frecuencia de la señal'],
      ans: 1, diff: 'Básico', emoji: '🔍',
      exp: 'La prueba de continuidad emite un sonido cuando detecta una trayectoria conductora de baja resistencia.',
      detail: 'La función de continuidad del multímetro inyecta una pequeña corriente entre las puntas y mide la resistencia resultante. Si la resistencia es inferior al umbral configurado (típicamente < 30Ω a < 100Ω según el modelo), emite una señal sonora (beep) continua. Es útil para: verificar fusibles, comprobar pistas en PCB, identificar cables en mazos, detectar cortocircuitos y verificar conexiones a tierra. No debe usarse en circuitos energizados.'
    },
    {
      q: '¿Cuál es la principal ventaja de un osciloscopio digital sobre uno analógico?',
      opts: ['Mayor ancho de banda', 'Captura y almacenamiento de señales', 'Menor precio', 'Pantalla más grande'],
      ans: 1, diff: 'Intermedio', emoji: '🖥️',
      exp: 'El osciloscopio digital puede capturar, almacenar y analizar señales que un analógico no puede retener.',
      detail: 'El osciloscopio digital de almacenamiento (DSO) convierte la señal analógica a digital mediante un ADC de alta velocidad, la almacena en memoria y la muestra en pantalla. Ventajas sobre el analógico: captura de eventos únicos o transitorios, almacenamiento y transferencia de capturas a PC, mediciones automáticas (Vrms, Vpp, frecuencia, etc.), análisis matemático (FFT, suma, resta de canales), mejor visualización de señales lentas y disparo avanzado. Marcas líderes: Rigol, Siglent, Keysight, Tektronix.'
    }
  ]
};

const RANKING_DATA = [
  { name: 'Ana García',   score: 4850, level: 'ORO' },
  { name: 'Pedro Ruiz',   score: 3920, level: 'PLATA' },
  { name: 'Lucía Méndez', score: 3100, level: 'PLATA' },
  { name: 'Jorge Torres', score: 2880, level: 'PLATA' },
  { name: 'Carlos López', score: 1850, level: 'BRONCE' },
  { name: 'María Silva',  score: 1620, level: 'BRONCE' },
  { name: 'Rafael Díaz',  score: 900,  level: 'BRONCE' }
];

const USERS_DATA = [
  { name: 'Carlos López', email: 'demo@quiz.com',  quizzes: 3, score: 1850 },
  { name: 'Ana García',   email: 'ana@quiz.com',   quizzes: 8, score: 4850 },
  { name: 'Pedro Ruiz',   email: 'pedro@quiz.com', quizzes: 6, score: 3920 }
];
