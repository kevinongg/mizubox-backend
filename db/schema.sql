DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS pre_made_box_contents;
DROP TABLE IF EXISTS user_custom_box_contents;
DROP TABLE IF EXISTS user_custom_box_sauces;
DROP TABLE IF EXISTS user_custom_box_extras;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS user_custom_boxes CASCADE;
DROP TABLE IF EXISTS pre_made_boxes;
DROP TABLE IF EXISTS extras CASCADE;
DROP TABLE IF EXISTS sauces;
DROP TABLE IF EXISTS nigiris;
DROP TABLE IF EXISTS users CASCADE;

/* ========= USERS ========= */
-- User authentication
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role TEXT DEFAULT 'user' -- (eg.. user || admin)
);

/* ========= NIGIRI ========= */
-- Core sushi items
CREATE TABLE nigiris (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
category TEXT NOT NULL, -- (eg.. fish || meat || veggie)
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) NOT NULL,
available BOOLEAN DEFAULT TRUE
-- quantity INTEGER NOT NULL,
);

/* ========= SAUCES ========= */
-- Optional add-ons
CREATE TABLE sauces (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) DEFAULT 0.00
-- quantity INTEGER NOT NULL,
);

/* ========= EXTRAS ========= */
-- Optional add-ons
CREATE TABLE extras (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) DEFAULT 0.00
-- quantity INTEGER NOT NULL,
);




/* ========= USER CUSTOM BOXES (USER & CUSTOM BOXES [one-to-many])========= */
-- Custom boxes created by a user. Must have minimum 14 nigiri
CREATE TABLE user_custom_boxes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ========= JUNCTION TABLE (CUSTOM BOXES & NIGIRIS [many-to-many]) ========= */
-- Nigiri inside user-created custom box
CREATE TABLE user_custom_box_contents (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  nigiri_id INT NOT NULL REFERENCES nigiris(id),
  quantity INT DEFAULT 1
);

/* ========= JUNCTION TABLE (CUSTOM BOXES & SAUCES [many-to-many]) ========= */
CREATE TABLE user_custom_box_sauces (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  sauce_id INT NOT NULL REFERENCES sauces(id),
  quantity INT DEFAULT 1
);

/* ========= JUNCTION TABLE (CUSTOM BOXES & EXTRAS [many-to-many]) ========= */
CREATE TABLE user_custom_box_extras (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  extra_id INT NOT NULL REFERENCES extras(id),
  quantity INT DEFAULT 1
);




/* ========= PRE-MADE BOXES ========= */
-- Sets of nigiri selected by chef
CREATE TABLE pre_made_boxes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(6,2) NOT NULL
);

/* ========= JUNCTION TABLE (PRE-MADE BOX & NIGIRI [many-to-many]) ========= */
-- Nigiri included in pre-made sets
CREATE TABLE pre_made_box_contents (
  id SERIAL PRIMARY KEY,
  pre_made_box_id INT NOT NULL REFERENCES pre_made_boxes(id) ON DELETE CASCADE,
  nigiri_id INT NOT NULL REFERENCES nigiris(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1
);




/* ========= CART ========= */
-- Cart logged and linked to each user
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);

/* ========= JUNCTION TABLE (CART & PRE-MADE BOXES & CUSTOM BOXES [many-to-many]) ========= */
-- Stores individual items that a user adds to their cart. Allows cart to hold multiple boxes, 
-- each potentially of different box types (pre-made or custom) and different quantities
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT REFERENCES cart(id) ON DELETE CASCADE,
  box_type TEXT CHECK (box_type IN ('pre-made', 'custom')),
  pre_made_box_id INT REFERENCES pre_made_boxes(id),
  user_custom_box_id INT REFERENCES user_custom_boxes(id),
  quantity INT DEFAULT 1
);




/* ========= ORDERS ========= */
-- Stores completed purchases
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- (eg.. 'pending', 'confirmed', 'delivered')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ========= JUNCTION TABLE (ORDERS & PRE-MADE BOXES & CUSTOM BOXES [many-to-many]) ========= */
-- Stores details about each item in a specific order
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  box_type TEXT CHECK (box_type IN ('pre-made', 'custom')),
  pre_made_box_id INT REFERENCES pre_made_boxes(id),
  user_custom_box_id INT REFERENCES user_custom_boxes(id),
  quantity INT DEFAULT 1
);