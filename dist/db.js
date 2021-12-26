"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const bookstore_pb_1 = require("../../proto/bookstore_pb");
const change_case_1 = require("change-case");
class DB {
    constructor(dbPath = null, initialData = null) {
        this.data = {
            books: new Map(),
            authors: new Map(),
        };
        this.dbPath = path_1.default.resolve(__dirname, '../db/db.json');
        if (dbPath)
            this.dbPath = dbPath;
        try {
            if (!initialData)
                (0, fs_1.accessSync)(this.dbPath, fs_1.constants.F_OK);
            this.load(initialData);
        }
        catch (error) {
            this.save();
        }
    }
    load(initialData = null) {
        const readData = initialData
            ? initialData
            : JSON.parse((0, fs_1.readFileSync)(this.dbPath, 'utf8'));
        this.data = {
            books: new Map(Array.isArray(readData.books) ? readData.books : new Map()),
            authors: new Map(Array.isArray(readData.authors) ? readData.authors : new Map()),
        };
    }
    save() {
        return (0, fs_1.writeFileSync)(this.dbPath, JSON.stringify({
            books: [...this.data.books.entries()],
            authors: [...this.data.authors.entries()],
        }));
    }
    addBook(book) {
        const id = crypto_1.default
            .createHash('sha256')
            .update(book.getTitle() + book.getAuthor())
            .digest('hex');
        if (this.getBook(id))
            throw new Error(`Book "${book.getTitle()}" by "${this.getAuthor(book.getAuthor()).getName()}" already exists`);
        if (!this.getAuthor(book.getAuthor()))
            throw new Error(`Author "${book.getAuthor()}" not found`);
        this.data.books.set(id, { ...book.toObject(), id });
        return this.getBook(id);
    }
    updateBook(bookId, updateData) {
        if (!this.data.books.has(bookId))
            throw new Error(`Book "${bookId}" not found`);
        this.data.books.set(bookId, {
            ...this.data.books.get(bookId),
            ...this.removeEmptyKeys(updateData),
        });
        return this.getBook(bookId);
    }
    deleteBook(id) {
        this.data.books.delete(id);
        return this;
    }
    getBook(id) {
        const doc = this.data.books.get(id);
        if (!doc)
            return;
        return this.fromObject(new bookstore_pb_1.Book(), doc);
    }
    listBooks() {
        return [...this.data.books.values()].map((doc) => {
            console.log(this.fromObject(new bookstore_pb_1.Book(), doc));
            return this.fromObject(new bookstore_pb_1.Book(), doc);
        });
    }
    addAuthor(author) {
        const id = crypto_1.default
            .createHash('sha256')
            .update(author.getName())
            .digest('hex');
        if (this.getAuthor(id))
            throw new Error(`Author "${author.getName()}" already exists`);
        this.data.authors.set(id, { ...author.toObject(), id });
        return this.getAuthor(id);
    }
    updateAuthor(authorId, updateData) {
        if (!this.data.authors.has(authorId))
            throw new Error(`Author "${authorId}" not found`);
        this.data.authors.set(authorId, {
            ...this.data.authors.get(authorId),
            ...this.removeEmptyKeys(updateData),
        });
        return this.getAuthor(authorId);
    }
    deleteAuthor(id) {
        this.data.authors.delete(id);
        return this;
    }
    listAuthors() {
        return [...this.data.authors.values()].map((doc) => this.fromObject(new bookstore_pb_1.Author(), doc));
    }
    getAuthor(id) {
        const author = this.data.authors.get(id);
        if (!author)
            return;
        return this.fromObject(new bookstore_pb_1.Author(), author);
    }
    fromObject(instance, document) {
        if (!document)
            return;
        for (const property in instance) {
            if (!/^set(?!Extension).*/g.test(property))
                continue;
            const propName = (0, change_case_1.camelCase)(property.replace('set', ''));
            const setter = instance[property];
            setter.call(instance, document[propName]);
        }
        return instance;
    }
    removeEmptyKeys(obj) {
        const clonedData = Object.assign({}, obj.toObject());
        Object.keys(clonedData).forEach((key) => !clonedData[key] && delete clonedData[key]);
        return clonedData;
    }
}
exports.DB = DB;
//# sourceMappingURL=db.js.map