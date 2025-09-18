import db from "#db/client";

import { faker } from "@faker-js/faker";
import { createUser } from "./queries/users.js";
import { createNigiri } from "./queries/nigiris.js";
import {
  addNigiriToPreMadeBox,
  createPreMadeBox,
} from "./queries/preMadeBoxes.js";
import {
  addNigiriToUserCustomBox,
  createUserCustomBox,
} from "./queries/UserCustomBoxes.js";
import { addItemToCart, createCart } from "./queries/cart.js";
import { addItemToOrder, createOrder } from "./queries/orders.js";

const seed = async () => {
  //*** Create 2 test users ***//
  let users = [];
  for (let i = 0; i < 2; i++) {
    const user = await createUser(
      faker.person.fullName(),
      faker.internet.exampleEmail(),
      faker.word.noun(),
      "user"
    );
    users.push(user);
  }

  //*** Create a couple of nigiris ***//
  const nigiriList = [
    {
      name: "Chutoro",
      category: "fish",
      description: "Fatty tuna from japan",
      imageUrl:
        "https://thejapanesebar.com/wp-content/uploads/2021/08/PXL_20210720_003439661-Chu-Toro-WEB1000-930x500.jpg",
      price: 9.0,
      available: true,
    },
    {
      name: "O-Toro",
      category: "fish",
      description: "Fatty tuna from japan",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpRLRoyFT35-QIi7XnOQ3yvUOS3V6GoLjlow&s",
      price: 11.0,
      available: true,
    },
    {
      name: "Sake",
      category: "fish",
      description: "King salmon from new zealand",
      imageUrl:
        "https://bentosushi.lv/image/cache/catalog/products/Sake-nigiri-800x557.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Uni",
      category: "shellfish",
      description: "Hokkaido uni from japan",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyVt7BfosNLJKci4jpfOc-W6vOueWmCiz0Eg&s",
      price: 15.0,
      available: true,
    },
    {
      name: "A5 wagyu",
      category: "beef",
      description: "A5 wagyu from japan",
      imageUrl:
        "https://s3-media0.fl.yelpcdn.com/bphoto/_pOvjO-ekV7xe2H6fuvHEw/258s.jpg",
      price: 15.0,
      available: true,
    },
  ];

  let nigiris = [];
  for (let item of nigiriList) {
    const nigiri = await createNigiri(
      item.name,
      item.category,
      item.description,
      item.imageUrl,
      item.price,
      item.available
    );
    nigiris.push(nigiri);
  }
  // console.log(nigiris);

  //*** Create pre-made mizubox ***//
  const preMade = await createPreMadeBox(
    "Chef's Choice 14",
    "14 pieces featuring daily catch",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ5nBaf-V43FujPdINAJJaSQQ5z-aUIUcMcA&s",
    80.0
  );
  // console.log(mizuBox);

  //*** Assign nigiri into created mizubox ***//
  await addNigiriToPreMadeBox(preMade.id, nigiris[0].id, 5);
  await addNigiriToPreMadeBox(preMade.id, nigiris[1].id, 5);
  await addNigiriToPreMadeBox(preMade.id, nigiris[2].id, 4);

  //*** Create custom box ***//
  const customBox = await createUserCustomBox(users[0].id);
  //*** Assign nigiri to created custom box ***//
  await addNigiriToUserCustomBox(customBox.id, nigiris[0].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[1].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[2].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[3].id, 2);

  // create cart
  const cart = await createCart(users[0].id);
  // add item to cart
  await addItemToCart(cart.id, "pre-made", preMade.id, 1);
  await addItemToCart(cart.id, "custom", customBox.id, 1);

  // create order
  const order = await createOrder(users[0].id, 200.0, "placed");
  // add item to order
  await addItemToOrder(order.id, "pre-made", preMade.id, 1);
  await addItemToOrder(order.id, "custom", customBox.id, 1);
};
await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");
