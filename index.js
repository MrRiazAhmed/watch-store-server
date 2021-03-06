const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oirzl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('watchStore');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');


        /* GET API */

        app.get('/allproducts', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })



        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })


        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })



        app.get('/myorders/:email', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })





        /* Post API */


        app.post('/orders', async (req, res) => {
            const orders = req.body;
            console.log('hit the apiiiiii', orders)
            const result = await ordersCollection.insertOne(orders);
            console.log(result)
            res.json(result)
        });


        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit', product)
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });




        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: (id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })


        app.delete('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


    }
    finally {
        /*  await client.close(); */
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Watch-Store')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
