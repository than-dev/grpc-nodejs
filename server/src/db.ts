import {
	accessSync,
	constants,
	readFileSync,
	writeFileSync,
	mkdirSync,
} from 'fs';
import path from 'path';
import crypto from 'crypto';

type Author = {
	id: string;
	name: string;
	imageUrl?: string;
	description?: string;
};

type Book = {
	id: string;
	name: string;
	title: string;
	author: string;
	description: string;
	image_url?: string;
	price?: number;
	pages?: number;
	published_date?: Date;
};

type id = string;

type Bookstore = {
	books: Map<id, Book>;
	authors: Map<id, Author>;
};

class DB {
	#data: Bookstore = {
		books: new Map(),
		authors: new Map(),
	};
	#dbPath = path.resolve(__dirname, '../db/db.json');

	constructor(dbPath = null) {
		if (dbPath) this.#dbPath = dbPath;
		try {
			accessSync(this.#dbPath, constants.F_OK);
			this.load();
		} catch (error) {
			mkdirSync(path.dirname(this.#dbPath), { recursive: true });
			this.save();
		}
	}

	load(): void {
		const readData = JSON.parse(readFileSync(this.#dbPath, 'utf8'));
		this.#data = {
			books: new Map(
				Array.isArray(readData.books) ? readData.books : new Map()
			),
			authors: new Map(
				Array.isArray(readData.authors) ? readData.authors : new Map()
			),
		};
	}

	save(): void {
		return writeFileSync(
			this.#dbPath,
			JSON.stringify({
				books: [...this.#data.books.entries()],
				authors: [...this.#data.authors.entries()],
			})
		);
	}

	addBook(book): Book | Error | undefined {
		const id = crypto
			.createHash('sha256')
			.update(book.title + book.author)
			.digest('hex');
		if (this.getBook(id))
			throw new Error(
				`Book "${book.title}" by "${
					this.getAuthor(book.author)!.name
				}" already exists`
			);
		if (!this.getAuthor(book.author))
			throw new Error(`Author "${book.author}" not found`);

		this.#data.books.set(id, { ...book, id });
		return this.getBook(id);
	}

	updateBook(bookId, updateData): Book | Error | undefined {
		if (!this.#data.books.has(bookId))
			throw new Error(`Book "${bookId}" not found`);
		const { id, ...data } = updateData;
		this.#data.books.set(bookId, { ...this.#data.books.get(bookId), ...data });
		return this.getBook(bookId);
	}

	deleteBook(id): DB {
		this.#data.books.delete(id);
		return this;
	}

	getBook(id): Book | undefined {
		return this.#data.books.get(id);
	}

	listBooks(): Book[] {
		return [...this.#data.books.values()];
	}

	addAuthor(author): Author | Error | undefined {
		const id = crypto.createHash('sha256').update(author.name).digest('hex');
		if (this.getAuthor(id))
			throw new Error(`Author "${author.name}" already exists`);
		this.#data.authors.set(id, { ...author, id });
		return this.getAuthor(id);
	}

	updateAuthor(authorId, updateData): Author | Error | undefined {
		if (!this.#data.authors.has(authorId))
			throw new Error(`Author "${authorId}" not found`);
		const { id, ...data } = updateData;
		this.#data.authors.set(authorId, {
			...this.#data.authors.get(authorId),
			...data,
		});
		return this.getAuthor(authorId);
	}

	deleteAuthor(id): DB {
		this.#data.authors.delete(id);
		return this;
	}

	listAuthors(): Author[] {
		return [...this.#data.authors.values()];
	}

	getAuthor(id): Author | undefined {
		return this.#data.authors.get(id);
	}

	get data(): Bookstore {
		return this.#data;
	}
}

module.exports = DB;
