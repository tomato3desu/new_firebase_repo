create database new_planet_app;

create table if not exists users(
    id int auto_increment primary key,
    uid varchar(255) unique not null,
    nickname varchar(255) default '未設定',
    icon_image_path varchar(255),
    comment varchar(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

create table if not exists pins(
    id int auto_increment primary key,
    created_user_id int not null,
    latitude decimal(10, 7) not null,
    longitude decimal(10, 7) not null,
    title varchar(255) not null,
    description VARCHAR(255),
    thumbnail_image_path varchar(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_pins FOREIGN KEY (created_user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

create table if not exists reviews(
    id int auto_increment primary key,
    created_user_id int not null,
    reviewed_pin_id int not null,
    title varchar(255) not null,
    description varchar(255),
    darkness_level int not null,
    access_level int not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pin FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_reviews FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT check_darkness CHECK (darkness_level between 1 and 5),
    CONSTRAINT check_access_level CHECK (access_level between 1 and 5)
);


CREATE TABLE IF NOT EXISTS review_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id int not null,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists pin_likes (
    id int auto_increment primary key,
    pin_id int not null,
    user_id int not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pin_likes_pin FOREIGN KEY (pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pin_likes_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_like UNIQUE (pin_id, user_id)
);

create or replace view pin_review_average as 
select 
p.id as pin_id,
p.title,
round(avg(r.darkness_level), 2) as avg_darkness,
round(avg(r.access_level), 2) as avg_access,
count(r.id) as review_count,
count(pl.id) as like_count 
from pins p 
left join reviews r on p.id = r.reviewed_pin_id
left join pin_likes pl on p.id = pl.pin_id
group by p.id, p.title;
