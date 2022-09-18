/**
 * Este es un ejemplo de una aplicación que usa NodeGUI para la creación de una interfaz gráfica.
 * Es un lector de entradas de Reddit de la comunidad indicada.
 * 
 * @author Alfonso Saavedra "Son Link"
 * @license MIT
 */

// Primero vamos a importar las clases de NodeGUI que vamos a ir usando.
const {
  ButtonRole,
  QBoxLayout,
  QComboBox,
  QIcon,
	QMainWindow,
	QLabel,
  QLineEdit,
	QListWidget,
	QListWidgetItem,
  QMessageBox,
  QPushButton,
  QTextBrowser,
  QVariant,
	QWidget
} = require('@nodegui/nodegui');

// Este es el modulo que usaremos para obtener y parsear el feed.
const Parser = require('rss-parser');
const parser = new Parser();
let feeds = []; // En este array iremos guardando las entradas obtenidas

const win = new QMainWindow(); // Esta es la ventana del programa.
win.setMinimumSize(640, 480);  // Ponemos el tamaño minino que tendrá la ventana.
win.setWindowTitle("Reddit Feed Reader"); // Y con esto ponemos el titulo de la ventana

// Vamos a añadir el icono de la ventana.
// __dirname contiene la ruta al fichero actual
const winIcon = new QIcon(__dirname + '/reddit.svg');
win.setWindowIcon(winIcon);

// Este widget es el widget central y sera el que contenta el resto de elementos.
const centralWidget = new QWidget();

// Esta es la disposición que se usara. El 2 indica que los elementos irán de arriba a abajo 
const rootLayout = new QBoxLayout(2);

// Ahora indicamos que esta sera la distribución del widget central
centralWidget.setLayout(rootLayout);

// Y finalmente establecemos el widget como el central de la ventana.
win.setCentralWidget(centralWidget);

// Esto es similar a lo de arriba, pero esta vez la disposición sera de izquierda a derecha
// y donde irán el texto, el input para introducir el subreddit, el selector y el botón
const hbox1 = new QWidget();
const hbox1_layout = new QBoxLayout(0);
hbox1.setLayout(hbox1_layout);
rootLayout.addWidget(hbox1); // Con esto añadimos el nuevo widget a la disposición principal.

// Vamos a añadir la etiqueta
const label1 = new QLabel();

// Con la siguiente función indicamos el texto que se mostrara
label1.setText('Introduce el subreddit:');
hbox1_layout.addWidget(label1);

// Esta es la clase para añadir un campo de texto (similar al <input type="text" /> de HTML)
const subreddit = new QLineEdit();
hbox1_layout.addWidget(subreddit);

// Esta es la clase para añadir un selector. Vamos a añadir las 3 opciones disponibles de ordenar las entradas
const cb_orden = new QComboBox();
cb_orden.addItem(null, 'Destacando');

// QVariant es la clase para almacenar datos dentro de algunos elementos.
// Lo usaremos para saber el orden en que obtendremos las entradas.
cb_orden.addItem(null, 'Nuevo', new QVariant('new'));
cb_orden.addItem(null, 'Más votados', new QVariant('top'));
hbox1_layout.addWidget(cb_orden);

// Esta es la clase para añadir un botón
const btn_leer = new QPushButton();
btn_leer.setText('Leer');
hbox1_layout.addWidget(btn_leer);

// Esta es la clase para añadir una lista y es donde mostraremos el listado de entradas obtenidas.
const lista_feeds = new QListWidget();
rootLayout.addWidget(lista_feeds);

// Esta es la clase para añadir un navegador de texto. En el mostraremos el contenido de la entrada seleccionada
const leer = new QTextBrowser();

// Poe defecto los enlaces externos no se abren,
// por lo que con esta función activamos dicha funcionalidad
leer.setOpenExternalLinks(true);
rootLayout.addWidget(leer);

// Para las alertas. Seria similar a la función alert() disponible en los navegadores web.
const messageBox = new QMessageBox();

// Con esto indicamos que sera un modal
messageBox.setModal(true);
messageBox.setWindowTitle('¡Error!');
const accept = new QPushButton();
accept.setText('Aceptar');
messageBox.addButton(accept, ButtonRole.AcceptRole);

// Y mostramos la ventana.
win.show();

// Esto es, según la documentación, para que al salir no se acumule basura.
global.win = win;

// Esta es la función encargada de obtener las entradas, generar el listado de ellas y guarda el contenido en el array.
const obtener_entradas = (async () => {

  // Vaciamos el array que contiene las entradas, así como el listado de entradas
  // y el navegador de texto
  feeds = []; 
  lista_feeds.clear();
  leer.clear();
  sr = subreddit.text(); // Obtenemos el subreddit que se escribió en el campo.
  sr = sr.trim(); // Eliminamos cualquier espacio antes y después del texto
  if (!sr) return; // Si el campo de texto esta vació, simplemente salimos de la función.

  try {
    // Removemos la escucha al evento cuando se selecciona una entrada de la lista
    // ya que de no hacerlo al limpiar el listado dará error
    lista_feeds.removeEventListener('currentItemChanged');

    // Obtenemos el indice del orden seleccionado y obtener su valor
    const index = cb_orden.currentIndex();
    const orden = cb_orden.itemData(index).toString();

    // Empezamos a definir la URL del feed
    let url = `https://www.reddit.com/r/${sr}/`;

    // Si se selecciono Nuevos o Más Votados añadimos ese orden a la URL.
    // Destacando es el orden por defecto.
    if (orden) url += `${orden}/`;

    // Procedemos a obtener el feed
    let feed = await parser.parseURL(`${url}.rss`);

    // Si se obtuvo correctamente y hay datos, procedemos a rellenar el listado
    // así como el array con el contenido de cada entrada.
    if (feed.items.length > 0) {
      feed.items.forEach(item => {
        l_item = new QListWidgetItem();
        l_item.setText(item.title);
        lista_feeds.addItem(l_item);
        feeds.push(item.content);
      });

      // Volvemos a activar la escucha del evento al seleccionar una entrada
      lista_feeds.addEventListener('currentItemChanged', itemSelected);
    } else {
      // Si no es así cambiamos el texto de la alerta y la mostramos
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

// Esta función es a la que se llama cuando pulsamos un item
// en la lista de entradas.
const itemSelected = () => {
  leer.clear();
  row = lista_feeds.currentRow();
  leer.insertHtml(feeds[row]);
}
