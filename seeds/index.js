
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
console.log(dbUrl);
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = (Math.floor(Math.random() * 20) + 9.99).toFixed(2);
        const camp = new Campground({
            author: '',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facere eaque nulla quisquam sequi atque obcaecati ipsam recusandae consequatur perspiciatis veniam, reiciendis placeat voluptas quos. Sint molestiae ea laborum quidem perferendis.',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
             },
            images: [
                {
                    url: 'https://res.cloudinary.com/dsgvp2wmj/image/upload/v1621434401/YelpCamp/odztskya3xmhtr1sl6mm.jpg',
                    filename: 'YelpCamp/odztskya3xmhtr1sl6mm'
                }]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})