const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'postgres.cuaob1ydiur8.us-east-1.rds.amazonaws.com',
    database:'postgres',
    password: '12345678',
  ssl: {
      rejectUnauthorized: false,},
});
app.use(express.json());


pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo el cliente de la base de datos', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error ejecutando la consulta', err.stack);
        }
        console.log('Conexión exitosa a la base de datos:', result.rows);
    });
});


app.get('/', (req, res) => {
    res.send('Bienvenido a la API de la tienda de mascotas');
});


app.get('/productos', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.post('/productos', async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    try {
        const { rows } = await pool.query('INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *', [nombre, descripcion, precio, stock]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.put('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio, stock } = req.body;
    try {
        const { rows } = await pool.query('UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *', [nombre, descripcion, precio, stock, id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.delete('/productos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { rows } = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
        } else {
            res.json({ mensaje: 'Producto eliminado exitosamente' });
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
