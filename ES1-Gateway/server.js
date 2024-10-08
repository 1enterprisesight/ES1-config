require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Service, Endpoint, Backend } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

// CRUD for Service
app.post('/service', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [Endpoint, Backend]
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for Endpoint
app.post('/service/:serviceId/endpoint', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    const endpoint = await Endpoint.create({ ...req.body, ServiceId: service.id });
    res.json(endpoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD for Backend
app.post('/service/:serviceId/backend', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    
    const backend = await Backend.create({ ...req.body, ServiceId: service.id });
    res.json(backend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate KrakenD JSON
app.get('/generate-json/:serviceId', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.serviceId, {
      include: [Endpoint, Backend]
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });

    const krakendJson = {
      version: service.version || '2.7',
      name: service.name,
      endpoints: service.Endpoints.map(endpoint => ({
        path: endpoint.path,
        method: endpoint.method
      })),
      backend: service.Backends.map(backend => ({
        url_pattern: backend.url,
        host: [backend.host]
      }))
    };

    res.json(krakendJson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

