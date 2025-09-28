DROP TABLE IF EXISTS order_item_extras;
DROP TABLE IF EXISTS order_item_sauces;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_item_extras;
DROP TABLE IF EXISTS cart_item_sauces;
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

-- ====================================
-- USERS (Authentication)
-- ====================================
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'user' -- (eg.. user || admin)
);

-- ====================================
-- NIGIRI (Menu items)
-- ====================================
CREATE TABLE nigiris (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
category TEXT NOT NULL, -- (eg.. fish || meat || veggie)
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) NOT NULL,
available BOOLEAN DEFAULT TRUE
-- quantity INTEGER NOT NULL
);

-- ======================================
-- SAUCES (Menu items) (Optional add-ons)
-- ======================================
CREATE TABLE sauces (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) DEFAULT 0.00
-- quantity INTEGER NOT NULL,
);

-- ======================================
-- EXTRAS (Menu items) (Optional add-ons)
-- ======================================
CREATE TABLE extras (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT,
image_url TEXT NOT NULL,
price DECIMAL(6,2) DEFAULT 0.00
-- quantity INTEGER NOT NULL,
);



-- =============================================================
-- USER CUSTOM BOXES (USER & CUSTOM BOXES) (One-To-Many)
-- =============================================================
-- [custom boxes created by a user. Must have minimum 14 nigiri]
CREATE TABLE user_custom_boxes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- JUNCTION TABLE (CUSTOM BOXES & NIGIRIS) (Many-To-Many)
-- =============================================================
-- [Nigiris inside user-created custom box]
CREATE TABLE user_custom_box_contents (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  nigiri_id INT NOT NULL REFERENCES nigiris(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(user_custom_box_id, nigiri_id)
);

/* ========= JUNCTION TABLE (CUSTOM BOXES & SAUCES [many-to-many]) ========= */
-- [Sauces inside user-created custom box]
CREATE TABLE user_custom_box_sauces (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  sauce_id INT NOT NULL REFERENCES sauces(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(user_custom_box_id, sauce_id)
);

/* ========= JUNCTION TABLE (CUSTOM BOXES & EXTRAS [many-to-many]) ========= */
-- [Extras inside user-created custom box]
CREATE TABLE user_custom_box_extras (
  id SERIAL PRIMARY KEY,
  user_custom_box_id INT NOT NULL REFERENCES user_custom_boxes(id) ON DELETE CASCADE,
  extra_id INT NOT NULL REFERENCES extras(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(user_custom_box_id, extra_id)
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
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', --(eg.. 'active' || 'checked_out')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id, user_id)
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
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(cart_id, pre_made_box_id),
  UNIQUE(cart_id, user_custom_box_id)
);

CREATE TABLE cart_item_sauces (
  id SERIAL PRIMARY KEY,
  cart_id INT REFERENCES cart(id) ON DELETE CASCADE,
  sauce_id INT REFERENCES sauces(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(cart_id, sauce_id)
);

CREATE TABLE cart_item_extras (
  id SERIAL PRIMARY KEY,
  cart_id INT REFERENCES cart(id) ON DELETE CASCADE,
  extra_id INT REFERENCES extras(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(cart_id, extra_id)
);


/* ========= ORDERS ========= */
-- Stores completed purchases
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed', -- (eg.. 'placed', 'confirmed', 'delivered')
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

/* ========= JUNCTION TABLE (ORDERS & PRE-MADE BOXES & CUSTOM BOXES [many-to-many]) ========= */
-- Table to grab order history box data
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  box_type TEXT CHECK (box_type IN ('pre-made', 'custom')),
  pre_made_box_id INT REFERENCES pre_made_boxes(id),
  user_custom_box_id INT REFERENCES user_custom_boxes(id),
  quantity INT DEFAULT 1,
  UNIQUE (order_id, pre_made_box_id),
  UNIQUE (order_id, user_custom_box_id)
);

CREATE TABLE order_item_sauces (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  sauce_id INT REFERENCES sauces(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(order_id, sauce_id)
);

CREATE TABLE order_item_extras (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  extra_id INT REFERENCES extras(id),
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(order_id, extra_id)
);

-- Table to grab order history information about sauces in a custom box
-- CREATE TABLE order_item_sauces (
--   id SERIAL PRIMARY KEY,
--   order_item_id INT REFERENCES order_items(id) ON DELETE CASCADE,
--   sauce_id INT REFERENCES sauces(id),
--   quantity INT NOT NULL DEFAULT 1
-- );

-- Table to grab order history information about extras in a custom box
-- CREATE TABLE order_item_extras (
--   id SERIAL PRIMARY KEY,
--   order_item_id INT REFERENCES order_items(id) ON DELETE CASCADE,
--   extra_id INT REFERENCES extras(id),
--   quantity INT NOT NULL DEFAULT 1
-- );


-- Do not need these tables, you are already able to grab information about a nigiri, sauce, or extra
-- inside a custom box.

-- Table to grab order history information about nigiris in a custom box
-- CREATE TABLE order_item_nigiris (
--   id SERIAL PRIMARY KEY,
--   order_item_id INT REFERENCES order_items(id) ON DELETE CASCADE,
--   nigiri_id INT REFERENCES nigiris(id),
--   quantity INT NOT NULL
-- );

