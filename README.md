To start this app you'll need node.js and npm.

Use "npm i" to install all the necessary packages.

You'll have to create our postgres database "booklist" and a table called "books" where you'll have to create this columns:

-- Table: public.books

-- DROP TABLE IF EXISTS public.books;

CREATE TABLE IF NOT EXISTS public.books
(
    id integer NOT NULL DEFAULT nextval('books_id_seq'::regclass),
    book_name character varying(45) COLLATE pg_catalog."default" NOT NULL,
    book_note character varying(150) COLLATE pg_catalog."default" NOT NULL,
    book_rate integer NOT NULL,
    read_start_date date NOT NULL,
    book_cover character varying(150) COLLATE pg_catalog."default",
    read_end_date date,
    CONSTRAINT books_pkey PRIMARY KEY (id),
    CONSTRAINT book_name UNIQUE (book_name)
        INCLUDE(book_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.books
    OWNER to postgres;
