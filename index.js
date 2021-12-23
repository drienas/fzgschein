if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

let iConnection, iChannel;

const rmq = require('./rmq');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/data', async (req, res) => {
  let body = req.body;
  if (!body.values) {
    res.status(400).send(`Kein gültiges Format`);
  } else {
    let values =
      typeof body.values === 'string' ? JSON.parse(body.values) : body.values;
    let picture = values['_1'] || null;
    let customerNumber = values['_2'] || null;
    let cnum = values['_3'] || null;

    let data = JSON.stringify({ picture, customerNumber, cnum });

    await iChannel.publish(
      'ai_data',
      'insert.fahrzeugschein',
      Buffer.from(JSON.stringify(data))
    );

    res.json(data);
  }
});

app.listen(3000, async () => {
  iConnection = await rmq.connect();
  iChannel = await rmq.initExchangeChannel(iConnection, 'ai_data');
  console.log(`App running on port 3000`);
});
