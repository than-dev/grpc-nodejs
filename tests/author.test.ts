import { ServerUnaryCall } from '@grpc/grpc-js';
import describe from 'ava';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import sinon from 'sinon';
import {
	Author,
	CreateAuthorRequest,
	CreateAuthorResponse,
	DeleteAuthorRequest,
	GetAuthorRequest,
	GetAuthorResponse,
	ListAuthorResponse,
	UpdateAuthorRequest,
	UpdateAuthorResponse,
} from '../proto/bookstore_pb';
import { DB } from '../src/db';
import { authorImpl } from '../src/handlers';

const request = (data: any) => ({
	request: data,
});

const initialData = {
	books: [],
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

describe('Should list all authors', (assert) => {
	const dbSpy = sandbox.spy(globalDb);
	const impl = authorImpl(dbSpy as unknown as DB);

	impl.listAuthor(
		{} as ServerUnaryCall<Empty, ListAuthorResponse>,
		(err, res) => {
			assert.true(dbSpy.listAuthors.calledOnce);
			assert.true(res!.getAuthorsList().length === 1);
			assert.falsy(err);
		}
	);

	sandbox.restore();
});

describe('Should give an error when try to remove an unexistent author', (assert) => {
	const deleteAuthorSpy = sandbox.spy(globalDb, 'deleteAuthor');
	sandbox.stub(globalDb, 'save').returns();
	sandbox.stub(globalDb, 'load').returns();

	const authorId = 'inexistentauthorid';

	const impl = authorImpl(globalDb);
	impl.deleteAuthor(
		request({
			getAuthorid: () => authorId,
		}) as ServerUnaryCall<DeleteAuthorRequest, Empty>,
		(err, res) => {
			assert.true(deleteAuthorSpy.notCalled);
			assert.truthy(err);

			// @ts-ignore
			assert.is(err!.message, `Author ${authorId} not found`);
			assert.true(globalDb.data.authors.size === 1);
		}
	);

	sandbox.restore();
});

describe('Should remove an existent author', (assert) => {
	const localDb = new DB(undefined, initialData);
	const deleteAuthorSpy = sinon.spy(localDb, 'deleteAuthor');
	sandbox.stub(globalDb, 'save').returns();
	sandbox.stub(globalDb, 'load').returns();

	const authorId = initialData.authors[0][1]['id'];

	const impl = authorImpl(localDb);
	impl.deleteAuthor(
		request({
			getAuthorid: () => authorId,
		}) as ServerUnaryCall<DeleteAuthorRequest, Empty>,
		(err, res) => {
			assert.true(deleteAuthorSpy.calledOnceWith(authorId));
			assert.falsy(err);
			assert.true(localDb.data.authors.size === 0);
			assert.deepEqual(res, new Empty());
		}
	);
});

describe('Should add an author correctly', (assert) => {
	const localDb = new DB(undefined, initialData);
	const addAuthorSpy = sinon.spy(localDb, 'addAuthor');

	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const impl = authorImpl(localDb);
	const author = new CreateAuthorRequest.CreateAuthorData().setName('any');

	impl.createAuthor(
		request({
			getAuthor: () => author,
		}) as ServerUnaryCall<CreateAuthorRequest, CreateAuthorResponse>,
		(err, res) => {
			assert.true(addAuthorSpy.calledOnceWith(author));
			assert.truthy(res);
			assert.is(res!.getAuthors()!.getName(), author.getName());
			assert.falsy(err);
			assert.true(localDb.data.authors.size === 2);
		}
	);

	sandbox.restore();
});

describe('Should not add an existent author', (assert) => {
	const localDb = new DB(undefined, initialData);
	const addAuthorSpy = sinon.spy(localDb, 'addAuthor');

	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const impl = authorImpl(localDb);
	const author = new CreateAuthorRequest.CreateAuthorData().setName(
		'Isaac Asimov'
	);

	impl.createAuthor(
		request({
			getAuthor: () => author,
		}) as ServerUnaryCall<CreateAuthorRequest, CreateAuthorResponse>,
		(err, res) => {
			assert.true(addAuthorSpy.calledOnceWith(author));
			assert.falsy(res);
			assert.truthy(err);
			assert.true(localDb.data.authors.size === 1);

			// @ts-ignore
			assert.regex(err!.message, /already exists/);
		}
	);

	sandbox.restore();
});

describe('Should get an existent author', (assert) => {
	const getAuthorSpy = sandbox.spy(globalDb, 'getAuthor');
	const impl = authorImpl(globalDb);
	const authorId = initialData.authors[0][1]['id'];

	impl.getAuthor(
		request({
			getAuthorid: () => authorId,
		}) as ServerUnaryCall<GetAuthorRequest, GetAuthorResponse>,
		(err, res) => {
			assert.true(getAuthorSpy.calledOnceWith(authorId));
			assert.deepEqual(
				res!.toObject().authors,
				initialData.authors[0][1] as Author.AsObject
			);
			assert.falsy(err);
		}
	);
	sandbox.restore();
});

describe('Should give an error when try to get a inexistent author', (assert) => {
	const getAuthorSpy = sandbox.spy(globalDb, 'getAuthor');
	const impl = authorImpl(globalDb);
	const authorId = 'inexistentauthorid';

	impl.getAuthor(
		request({
			getAuthorid: () => authorId,
		}) as ServerUnaryCall<GetAuthorRequest, GetAuthorResponse>,
		(err, res) => {
			assert.true(getAuthorSpy.calledOnceWith(authorId));
			assert.falsy(res);
			assert.truthy(err);

			// @ts-ignore
			assert.is(err!.message, `Author ${authorId} not found`);
		}
	);
});

describe('Should update a existent author', (assert) => {
	const localDb = new DB(undefined, initialData);
	const updateAuthorSpy = sinon.spy(localDb, 'updateAuthor');
	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const authorId = initialData.authors[0][1]['id'];
	const updateAuthorData = new UpdateAuthorRequest.UpdateAuthorData().setName(
		'test'
	);

	const impl = authorImpl(localDb);

	impl.updateAuthor(
		request({
			getAuthorid: () => authorId,
			getData: () => updateAuthorData,
		}) as ServerUnaryCall<UpdateAuthorRequest, UpdateAuthorResponse>,
		(err, res) => {
			assert.true(updateAuthorSpy.calledOnceWith(authorId, updateAuthorData));
			assert.truthy(res);
			assert.is(res!.toObject()!.authors!.name, updateAuthorData.getName());
			assert.falsy(err);
		}
	);
});

describe('Should give an error when try to update a inexistent author', (assert) => {
	const localDb = new DB(undefined, initialData);
	const updateAuthorSpy = sinon.spy(localDb, 'updateAuthor');
	sinon.stub(localDb, 'save').returns();
	sinon.stub(localDb, 'load').returns();

	const authorId = 'inexistentauthorid';
	const updateAuthorData = new UpdateAuthorRequest.UpdateAuthorData().setName(
		'test'
	);

	const impl = authorImpl(localDb);

	impl.updateAuthor(
		request({
			getAuthorid: () => authorId,
			getData: () => updateAuthorData,
		}) as ServerUnaryCall<UpdateAuthorRequest, UpdateAuthorResponse>,
		(err, res) => {
			assert.true(updateAuthorSpy.notCalled);
			assert.falsy(res);
			assert.truthy(err);

			// @ts-ignore
			assert.is(err!.message, `Author ${authorId} not found`);
		}
	);
});
