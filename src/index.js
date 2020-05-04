/**
 * Este es un ejemplo de una aplicación que usa NodeGUI ara la creación de una interfaz gráfica.
 * 
 * @author Alfonso Saavedra "Son Link"
 * @license MIT
 */

// Primero vamos a importar las clases de NodeGUI que vamos a ir usando.
const {
	QMainWindow,
	QWidget,
	QLabel,
	QPushButton,
	QListWidget,
	QListWidgetItem,
  QBoxLayout,
  QLineEdit,
  QScrollArea,
  QTextBrowser,
  QMessageBox,
  ButtonRole
} = require('@nodegui/nodegui');

// Este es el modulo que usaremos para parsear el feed.
const Parser = require('rss-parser');
const parser = new Parser();
let feeds = []; // En este array iremos guardando las entradas obtenidas

const win = new QMainWindow(); // Esta es la ventana del programa.
win.setMinimumSize(640, 480);  // Ponemos el tamaño minino que tendrá la ventana.
win.setWindowTitle("Reddit Feed Reader"); // Y con esto ponemos el titulo de la ventana

const centralWidget = new QWidget();    // Este widget es el widget central y sera el que contenta el resto de elementos.
const rootLayout = new QBoxLayout(2);   // Este el el diseño que se usara. El 2 indica que los elementos irán de arriba a abajo 
centralWidget.setLayout(rootLayout);    // Establecemos el diseño para el widget
win.setCentralWidget(centralWidget);    // Y finalmente establecemos el widget como el central de la ventana.

// Esto es similar a lo de arriba, pero esta vez el diseño ira de izquierda a derecha.
const hbox1 = new QWidget();
const hbox1_layout = new QBoxLayout(0);
hbox1.setLayout(hbox1_layout);
rootLayout.addWidget(hbox1); // Con esto añadimos el nuevo widget al diseño principal.

// Vamos a añadir una etiqueta
const label1 = new QLabel();
label1.setText('Introduce el subreddit:'); // Y ahora establecemos el texto de la etiqueta.
hbox1_layout.addWidget(label1); // Y lo añadimos al diseño horizontal.

// Esta es la clase para añadir un campo de texto (similar al <input type="text" /> de HTML)
const subreddit = new QLineEdit();
hbox1_layout.addWidget(subreddit);

// Esta es la clase para añadir un botón
const btn_leer = new QPushButton();
btn_leer.setText('Leer');
hbox1_layout.addWidget(btn_leer);

// Esta es la clase para añadir una lista y es donde mostraremos el listado de entradas obtenidas.
const lista_feeds = new QListWidget();
rootLayout.addWidget(lista_feeds);

// Esta es la clase para aañdir un área con scroll.
// Este es necesario si vamos a tener elementos que ocuparan más que la ventana para así mostrar las barras de scroll en caso necesario
const scrollArea = new QScrollArea();
rootLayout.addWidget(scrollArea);

// Esta es la clase para añadir un navegador de texto. En el mostraremos el contenido de la entrada selccionada
const leer = new QTextBrowser();
leer.setOpenExternalLinks(true);
scrollArea.setWidget(leer);

// Para las alertas. Seria similar a la función alert() disponible en los navegadores web.
const messageBox = new QMessageBox();
messageBox.setModal(true);
messageBox.setWindowTitle('¡Error!');
const accept = new QPushButton();
accept.setText('Aceptar');
messageBox.addButton(accept, ButtonRole.AcceptRole);

// Y mostramos la ventana.
win.show();

// Esto es, segun la documentación, para que al salir no se acumule basura.
global.win = win;

// Esta es la función encargada de obtener las entradas, generar el listado de ellas y guarda el contenido en el array.
const obtener_entradas = (async () => {
  feeds = []; // Vaciamos el array que contiene las entradas.
  sr = subreddit.text(); // Obtenemos el subreddit que se escribió en el campo.
  sr = sr.trim(); // Eliminamos cualquier espacio antes y después del texto
  if (!sr) return; // Si el texto esta vario, simplemente se sale.
  try {
    let feed = await parser.parseURL(`https://www.reddit.com/r/${sr}/.rss`);
    if (feed.items.length > 0) {
      feed.items.forEach(item => {
        l_item = new QListWidgetItem();
        l_item.setText(item.title);
        lista_feeds.addItem(l_item);
        feeds.push(item.content);
      });
    } else {
      messageBox.setText('El subreddit no existe o no hay entradas.');
      messageBox.exec();
    }
  } catch (error) {
    console.error(error);
    messageBox.setText('Ocurrió un error al obtener el feed.');
    messageBox.exec();
  }
});

// Creo que no hace falta explicar que es un addEventListener ;)
btn_leer.addEventListener('clicked', obtener_entradas);
lista_feeds.addEventListener('currentItemChanged', () => {
  leer.clear();
  row = lista_feeds.currentRow();
  leer.insertHtml(feeds[row]);
});