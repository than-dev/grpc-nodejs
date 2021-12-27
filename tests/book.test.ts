import describe from 'ava';
import sinon from 'sinon';
import { bookstoreImpl } from '../src/handlers/index';
import { DB } from '../src/db';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { ServerUnaryCall } from '@grpc/grpc-js';
import {
	CreateBookRequest,
	CreateBookResponse,
	DeleteBookRequest,
	GetBookRequest,
	GetBookResponse,
	ListBookResponse,
	UpdateBookRequest,
	UpdateBookResponse,
} from '../proto/bookstore_pb';

const request = (data: any) => ({
	request: data,
});

const initialData = {
	books: [
		[
			'634c585102e1dc2959ec63154ce895a6b00a540b168b270d016daaddbdf812bf',
			{
				title: 'Eu, Robô',
				author:
					'75abf34d45f25ade860e3a8577d4529dab1b3658028ef82584b5ba1a393a4d65',
				imageUrl:
					'https://skoob.s3.amazonaws.com/livros/241/EU_ROBO_1228412917B.jpg',
				pages: 320,
				id: '634c585102e1dc2959ec63154ce895a6b00a540b168b270d016daaddbdf812bf',
			},
		],
	],
	authors: [
		[
			'75abf34d45f25ade860e3a8577d4529dab1b3658028ef82584b5ba1a393a4d65',
			{
				name: 'Isaac Asimov',
				imageUrl:
					'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Isaac.Asimov01.jpg/440px-Isaac.Asimov01.jpg',
				description:
					'Isaac Asimov was an American writer and professor of biochemistry at Boston University. He was known for his works of science fiction and popular science. Asimov was a prolific writer, and wrote or edited more than 500 books. He also wrote an estimated 90,000 letters and postcards',
				id: '75abf34d45f25ade860e3a8577d4529dab1b3658028ef82584b5ba1a393a4d65',
			},
		],
	],
};

const globalDb = new DB(undefined, initialData);
const sandbox = sinon.createSandbox();

describe('Should list all books', (assert) => {
	const dbSpy = sandbox.spy(globalDb);
	const impl = bookstoreImpl(dbSpy as unknown as DB);

	impl.listBook({} as ServerUnaryCall<Empty, ListBookResponse>, (err, res) => {
		assert.true(dbSpy.listBooks.calledOnce);
		assert.true(res!.getBooksList()!.length === 1);
		assert.falsy(err);
	});

	sandbox.restore();
});

describe('Should get a book correctly', (assert) => {
	const dbSpy = sandbox.spy(globalDb);
	const impl = bookstoreImpl(dbSpy as unknown as DB);
	const bookId = initialData.books[0][1]['id'];

	impl.getBook(
		request({
			getBookid: () => bookId,
		}) as ServerUnaryCall<GetBookRequest, GetBookResponse>,
		(err, res) => {
			assert.true(dbSpy.getBook.calledOnce);
			assert.true(dbSpy.getBook.calledWith(bookId));
			assert.truthy(res!.getBooks());
			assert.is(res!.getBooks()!.getId(), bookId);
			assert.falsy(err);
		}
	);
	sandbox.restore();
});

describe('Should give an error when try to remove a inexistent book', (assert) => {
	const deleteBookSpy = sandbox.spy(globalDb, 'deleteBook');
	sandbox.stub(globalDb, 'save').returns();
	sandbox.stub(globalDb, 'load').returns();

	const impl = bookstoreImpl(globalDb);
	const bookId = 'nonexistingbookid';

	impl.deleteBook(
		request({
			getBookid: () => bookId,
		}) as ServerUnaryCall<DeleteBookRequest, Empty>,
		(err, res) => {
			assert.true(deleteBookSpy.notCalled);
			assert.truthy(err);

			// @ts-ignore
			assert.is(err.message, `Book ${bookId} not found`);
			assert.true(globalDb.data.books.size === 1);
		}
	);

	sandbox.restore();
});

describe('Should remove a existent book', (assert) => {
	const localDb = new DB(undefined, initialData);
	const deleteBookSpy = sinon.spy(localDb, 'deleteBook');
	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const bookId = initialData.books[0][1]['id'];

	const impl = bookstoreImpl(localDb);
	impl.deleteBook(
		request({
			getBookid: () => bookId,
		}) as unknown as ServerUnaryCall<DeleteBookRequest, Empty>,
		(err, res) => {
			assert.true(deleteBookSpy.calledOnceWith(bookId));
			assert.falsy(err);
			assert.true(localDb.data.books.size === 0);
			assert.deepEqual(res, new Empty());
		}
	);
});

describe('Should give an error when try to get a inexistent book', (assert) => {
	const dbSpy = sandbox.spy(globalDb);
	const impl = bookstoreImpl(dbSpy as unknown as DB);
	const bookId = 'nonexistingbookid';

	impl.getBook(
		request({
			getBookid: () => bookId,
		}) as ServerUnaryCall<GetBookRequest, GetBookResponse>,
		(err, res) => {
			assert.true(dbSpy.getBook.calledOnce);
			assert.true(dbSpy.getBook.calledWith(bookId));

			// @ts-ignore
			assert.is(err.message, `Book ${bookId} not found`);
			assert.true(globalDb.data.books.size === 1);
		}
	);

	sandbox.restore();
});

describe('Should give an error when try to update a inexistent book', (assert) => {
	const localDb = new DB(undefined, initialData);
	const updateBookSpy = sinon.spy(localDb, 'updateBook');

	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const bookId = 'nonexistingbookid';
	const fakeData = { title: 'teste' };

	const impl = bookstoreImpl(localDb);
	impl.updateBook(
		request({
			getBookid: () => bookId,
			getData: () => fakeData,
		}) as ServerUnaryCall<UpdateBookRequest, UpdateBookResponse>,
		(err, res) => {
			assert.true(updateBookSpy.notCalled);
			// @ts-ignore
			assert.is(err.message, `Book ${bookId} not found`);
			assert.truthy(err);
			assert.deepEqual(res, null);
		}
	);
});

describe('Should update an existent book', (assert) => {
	const localDb = new DB(undefined, initialData);
	const updateBookSpy = sinon.spy(localDb, 'updateBook');

	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const bookId = initialData.books[0][1]['id'];
	const fakeData = new UpdateBookRequest.UpdateBookData().setTitle('test');

	const impl = bookstoreImpl(localDb);
	impl.updateBook(
		request({
			getBookid: () => bookId,
			getData: () => fakeData,
		}) as ServerUnaryCall<UpdateBookRequest, UpdateBookResponse>,
		(err, res) => {
			assert.true(updateBookSpy.calledOnceWith(bookId, fakeData));
			assert.falsy(err);
			assert.truthy(res!.getBooks());
			assert.is(res!.getBooks()!.getTitle(), 'test');
			assert.is(res!.getBooks()!.getId(), bookId);
		}
	);
});

describe('Should not add an existent book', (assert) => {
	const localDb = new DB(undefined, initialData);
	const addBookSpy = sinon.spy(localDb, 'addBook');
	const addBookData = new CreateBookRequest.CreateBookData()
		.setTitle('Eu, Robô')
		.setAuthor(
			'75abf34d45f25ade860e3a8577d4529dab1b3658028ef82584b5ba1a393a4d65'
		);

	const impl = bookstoreImpl(localDb);
	impl.createBook(
		request({
			getBook: () => addBookData,
		}) as ServerUnaryCall<CreateBookRequest, CreateBookResponse>,
		(err, res) => {
			assert.true(addBookSpy.calledOnce);
			assert.truthy(err);
			//@ts-ignore
			assert.regex(err!.message, /already exists/);
			assert.falsy(res);
		}
	);
});

describe('Should not add a book with a inexistent author', (assert) => {
	const localDb = new DB(undefined, initialData);
	const addBookSpy = sinon.spy(localDb, 'addBook');
	const addBookData = new CreateBookRequest.CreateBookData()
		.setTitle('Eu, Robô')
		.setAuthor('nonexistingauthorid');

	const impl = bookstoreImpl(localDb);
	impl.createBook(
		request({
			getBook: () => addBookData,
		}) as ServerUnaryCall<CreateBookRequest, CreateBookResponse>,
		(err, res) => {
			assert.true(addBookSpy.calledOnce);
			assert.truthy(err);
			//@ts-ignore
			assert.is(err!.message, `Author "${addBookData.getAuthor()}" not found`);
			assert.falsy(res);
		}
	);
});

describe('Should add a new book correctly', (assert) => {
	const localDb = new DB(undefined, initialData);
	const addBookSpy = sinon.spy(localDb, 'addBook');
	const addBookData = new CreateBookRequest.CreateBookData()
		.setTitle('Title that is not in use')
		.setAuthor(initialData.authors[0][1]['id']);

	const impl = bookstoreImpl(localDb);
	impl.createBook(
		request({
			getBook: () => addBookData,
		}) as ServerUnaryCall<CreateBookRequest, CreateBookResponse>,
		(err, res) => {
			assert.true(addBookSpy.calledOnceWith(addBookData));
			assert.falsy(err);
			//@ts-ignore
			assert.truthy(res);
			assert.is(res!.getBooks()!.getTitle(), addBookData.getTitle());
			assert.true(localDb.data.books.size === 2);
		}
	);
});
