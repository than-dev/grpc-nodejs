"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImplementation = void 0;
const empty_pb_1 = require("google-protobuf/google/protobuf/empty_pb");
const bookstore_pb_1 = require("../../../proto/bookstore_pb");
const inject_1 = require("../lib/inject");
function GetAuthor(call, callback, database) {
    try {
        const response = new bookstore_pb_1.GetAuthorResponse();
        response.setAuthors(assertAuthor(database, call.request.getAuthorid()));
        return callback(null, response);
    }
    catch (error) {
        return callback(error, null);
    }
}
function UpdateAuthor(call, callback, database) {
    try {
        assertAuthor(database, call.request.getAuthorid());
        const newAuthor = database.updateAuthor(call.request.getAuthorid(), call.request.getData());
        database.save();
        return callback(null, new bookstore_pb_1.UpdateAuthorResponse().setAuthors(newAuthor));
    }
    catch (error) {
        return callback(error, null);
    }
}
function DeleteAuthor(call, callback, database) {
    try {
        assertAuthor(database, call.request.getAuthorid());
        database.deleteAuthor(call.request.getAuthorid());
        database.save();
        return callback(null, new empty_pb_1.Empty());
    }
    catch (error) {
        return callback(error, null);
    }
}
function ListAuthor(_, callback, database) {
    return callback(null, new bookstore_pb_1.ListAuthorResponse().setAuthorsList(database.listAuthors()));
}
function CreateAuthor(call, callback, database) {
    try {
        const newAuthor = database.addAuthor(call.request.getAuthor());
        database.save();
        return callback(null, new bookstore_pb_1.CreateAuthorResponse().setAuthors(newAuthor));
    }
    catch (error) {
        return callback(error, null);
    }
}
function assertAuthor(database, id) {
    const author = database.getAuthor(id);
    if (!author)
        throw new Error(`Author ${id} not found`);
    return author;
}
function getImplementation(databaseInstance) {
    return {
        getAuthor: (0, inject_1.inject)(GetAuthor, databaseInstance),
        updateAuthor: (0, inject_1.inject)(UpdateAuthor, databaseInstance),
        deleteAuthor: (0, inject_1.inject)(DeleteAuthor, databaseInstance),
        listAuthor: (0, inject_1.inject)(ListAuthor, databaseInstance),
        createAuthor: (0, inject_1.inject)(CreateAuthor, databaseInstance),
    };
}
exports.getImplementation = getImplementation;
//# sourceMappingURL=author.js.map