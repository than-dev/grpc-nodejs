import {
	Author,
	Book,
	CreateAuthorRequest,
	CreateBookRequest,
	UpdateAuthorRequest,
	UpdateBookRequest,
} from '../proto/bookstore_pb';
export declare class DB {
	data: {
		books: Map<string, Book.AsObject>;
		authors: Map<string, Author.AsObject>;
	};
	private readonly dbPath;
	constructor(dbPath?: null, initialData?: null);
	load(initialData?: null): void;
	save(): void;
	addBook(book: CreateBookRequest.CreateBookData): Book | undefined;
	updateBook(
		bookId: string,
		updateData: UpdateBookRequest.UpdateBookData
	): Book | undefined;
	deleteBook(id: string): this;
	getBook(id: string): Book | undefined;
	listBooks(): Book[];
	addAuthor(author: CreateAuthorRequest.CreateAuthorData): Author | undefined;
	updateAuthor(
		authorId: string,
		updateData: UpdateAuthorRequest.UpdateAuthorData
	): Author | undefined;
	deleteAuthor(id: string): this;
	listAuthors(): Author[];
	getAuthor(id: string): Author | undefined;
	private fromObject;
	private removeEmptyKeys;
}
