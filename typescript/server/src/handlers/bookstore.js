//! call = request | callback = response
//! this implementations are like controllers

function GetBook(database) {
    return (call, callback) => {
        try {
            const { id } = call.request
            const book = assertBook(database, id)
            return callback(null, { books: book })
        } catch (error) {
            return callback(error, null)
        }
    }
}

function DeleteBook(database) {
    return (call, callback) => {
        try {
            const { bookId } = call.request

            assertBook(database, bookId)
            database.deleteBook(bookId)
            database.save()

            return callback(null, {})
        } catch (error) {
            return callback(error, null)
        }
    }
}

function ListBook(database) {
    return (_, callback) => 
        callback(null, { books: database.listBooks() })
}

function CreateBook(database) {
    return (call, callback) => {
        try {
            const { book } = call.request

            const newBook = database.addBook(book)
            database.save()

            return callback(null, { books: newBook })
        } catch (error) {
            return callback(error, null)
        }
    }
}

function UpdateBook(database) {
    return (call, callback) => {
        try {
            const { bookId, data } = call.request
            assertBook(database, bookId)

            const updatedBook = database.updateBook(bookId, data)
            database.save()

            return callback(null, updatedBook)
        } catch (error) {
            return callback(error, null)
        }
    }
}

function assertBook(database, id) {
    const book = database.getBook(id)
    if(!book) throw new Error(`Book ${id} not found`)
    return book
}

module.exports = (databaseInstance) => ({
    GetBook: GetBook(databaseInstance),
    UpdateBook: UpdateBook(databaseInstance),
    DeleteBook: DeleteBook(databaseInstance),
    ListBook: ListBook(databaseInstance),
    CreateBook: CreateBook(databaseInstance)
}) 