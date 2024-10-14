import puppeteer from "puppeteer";
import { MongoClient } from 'mongodb';

// Palabras con más de 15 entradas se considerarán, las que no, únicamente se les agregará el
// "conjugado = true"

const db_client = new MongoClient('mongodb+srv://CeroUnoClusterAdmin:209197219Jenniffer@cluster0.pk2h25a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const browser = await puppeteer.launch({ headless: "new", args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
  ],
  timeout: 60000,
});

async function scrapWord(word) {
    /*
    Params
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
    */
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1, });
    page.setDefaultTimeout(60000);
    await page.setJavaScriptEnabled(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    try {
        await page.goto(`https://www.wordreference.com/conj/esverbs.aspx?v=${word}`, {
            waitUntil: 'networkidle0',
            timeout: 60000,
        })
        await page.waitForSelector('#contenttable');
        const conj = await page.evaluate(() => {
            // let variantes = document.getElementById('cheader').querySelectorAll('td')[1].innerText.replaceAll('\n', ', ').replaceAll('⇒', '').trim()
            if (document.getElementById('cheader')) {
                let variantes = document.getElementById('cheader').querySelectorAll('td')[1].innerText.replaceAll('\n', ', ').replaceAll('⇒', '').trim().split(', ');
                //! let indicativos = 
                let raw_indicativos = [];
                document.querySelector('.aa').querySelectorAll('table tbody tr td').forEach(e => {
                    if (raw_indicativos.indexOf(e.innerText) == -1) {
                        if (e.innerText.split(', ').length > 0) {
                            raw_indicativos = raw_indicativos.concat(e.innerText.split(', '))
                        } else {
                            raw_indicativos.push(e.innerText);
                        }
                    }
                });
                // let indicativos = raw_indicativos.join(', ');
                let final = [...raw_indicativos, ...variantes];
                return final;
            }
            return null;
        });
        await page.close();
        let f_word = [];
        if (word.split(' o ').length > 0) {
            f_word = word.split(' o ');
        } else {
            f_word = [word]
        }
        return conj ? [...f_word, ...conj] : f_word;
    } catch (e) {
        console.error(e);
        await page.close();
    }
}

(async () => {
    await db_client.connect();
    console.log('Base de Datos conectada');
    const db = db_client.db('Hermes');
    const collection = db.collection('Diccionario');
    const backup_coll = db.collection('_Diccionario_');
    // const data = await collection.find({ }).toArray();
    //! a, b, c, d, e, f, g, h, i, j, k, l, m, n, ñ, o, p, q, r, s, t, u, v, w, x, y, z
    //* z
    //? Primero empezaremos con las palabras con Carácter Especial
    const data = await collection.find({
        // Asegúrate de que "text" sea un arreglo no vacío
        text: { $exists: true, $not: { $size: 0 } },
        // Aplica el filtro solo a la primera entrada del arreglo "text"
        "text.0": { 
          $regex: /^[¿¡abcdefghijklmnñopqrstuvwxyz]/i  // Busca si comienza con "¡" o "¿" sin importar mayúsculas/minúsculas
        }
      }).toArray();
    for (let entry of data) {
        let newEntry = { }
        newEntry.id = entry.id;
        newEntry.images = entry.images;
        newEntry.text = [ ];
        console.log(`Analizando palabra con ID: ${entry.id} y primera entrada ${entry['text'][0]}`);
        if (entry['text'].length < 15) {
            console.log('Palabra sin conjugación... Buscando...');
            for await (let word of entry['text']) {
                console.log(`Scrapeando palabra: ${word}`);
                const conj = await scrapWord(word);
                newEntry.text = newEntry.text.concat(conj);
                console.log('Listo...');
            }
            console.log('Listo con el registro...');
        } else {
            newEntry.text = entry.text;
            console.log('Palabra con conjugación lista.');
        }
        await backup_coll.insertOne(newEntry);
        console.log(`Insertado`)
        // await collection.updateOne({ id: entry['id'] }, entry);
    }
    console.log('¡Listo con todo!')
    return;
    exit();
})();