create database new_planet_app;

create table if not exists users(
    id int auto_increment primary key,
    uid varchar(255) unique not null,
    nickname varchar(255) default '未設定',
    icon_image_path varchar(255),
    comment varchar(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    prefecture_id int,
    role varchar(255) default 'user',
    is_active boolean default true
);

ALTER TABLE users
ADD COLUMN prefecture_id INT,
ADD CONSTRAINT fk_user_prefecture
    FOREIGN KEY (prefecture_id)
    REFERENCES prefectures(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

ALTER TABLE users
ADD COLUMN role varchar(255) default 'user';

ALTER TABLE users
ADD COLUMN isActive boolean default true;

CREATE TABLE IF NOT EXISTS prefectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capital VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL
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
    season varchar(20) NOT NULL,
    visited_date date not null,
    visited_time time not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_pin FOREIGN KEY (reviewed_pin_id) REFERENCES pins(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT check_darkness CHECK (darkness_level between 1 and 5),
    CONSTRAINT check_access_level CHECK (access_level between 1 and 5)
);

alter table season 

CREATE TABLE IF NOT EXISTS review_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id int not null,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists pin_bookmarks(
    id int auto_increment primary key,
    bookmarked_user_id int not null,
    bookmarked_pin_id int not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pin_bookmark_pin FOREIGN KEY (bookmarked_pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pin_bookmark_user FOREIGN KEY (bookmarked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_bookmark UNIQUE (bookmarked_pin_id, bookmarked_user_id)
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
left join pin_likes pl on p.id = pl.liked_pin_id
group by p.id, p.title;
