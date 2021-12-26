"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImplementation = void 0;
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const bookstore_pb_1 = require("../../../proto/bookstore_pb");
const inject_1 = require("../lib/inject");
function GetBook(call, callback, database) {
    try {
        const book = assertBook(database, call.request.getBookid());
        const response = new bookstore_pb_1.GetBookResponse();
        response.setBooks(book);
        return callback(null, response);
    }
    catch (error) {
        return callback(error, null);
    }
}
function UpdateBook(call, callback, database) {
    try {
        assertBook(database, call.request.getBookid());
        const newBook = database.updateBook(call.request.getBookid(), call.request.getData());
        database.save();
        return callback(null, new bookstore_pb_1.UpdateBookResponse().setBooks(newBook));
    }
    catch (error) {
        return callback(error, null);
    }
}
function DeleteBook(call, callback, database) {
    try {
        assertBook(database, call.request.getBookid());
        database.deleteBook(call.request.getBookid());
        database.save();
        return callback(null, new empty_pb_1.Empty());
    }
    catch (error) {
        return callback(error, null);
    }
}
function ListBook(_, callback, database) {
    return callback(null, new bookstore_pb_1.ListBookResponse().setBooksList(database.listBooks()));
}
function CreateBook(call, callback, database) {
    try {
        const newBook = database.addBook(call.request.getBook());
        database.save();
        return callback(null, new bookstore_pb_1.CreateBookResponse().setBooks(newBook));
    }
    catch (error) {
        return callback(error, null);
    }
}
function assertBook(database, id) {
    const book = database.getBook(id);
    if (!book)
        throw new Error(`Book ${id} not found`);
    return book;
}
function getImplementation(databaseInstance) {
    return {
        getBook: (0, inject_1.inject)(GetBook, databaseInstance),
        updateBook: (0, inject_1.inject)(UpdateBook, databaseInstance),
        deleteBook: (0, inject_1.inject)(DeleteBook, databaseInstance),
        listBook: (0, inject_1.inject)(ListBook, databaseInstance),
        createBook: (0, inject_1.inject)(CreateBook, databaseInstance),
    };
}
exports.getImplementation = getImplementation;
//# sourceMappingURL=bookstore.js.map