create database chat;

drop table if exists users cascade;
create table users (
    user_id serial not null primary key,
    username varchar(20) not null unique,
    email varchar(40) not null,
    password varchar(40) not null,
    avatar_link varchar(256) not null
);

drop table if exists messages cascade;
create table messages (
    message_id serial not null primary key,
    user_id int not null references users(user_id),
    message text null,
    file_url varchar(256) null,
    message_time time not null default current_timestamp
);