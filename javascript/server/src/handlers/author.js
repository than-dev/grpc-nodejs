//! call = request | callback = response
//! this implementations are like controllers

function GetAuthor(database) {
    return (call, callback) => {
        try {
            const { id } = call.request
            const author = assertAuthor(database, id)

            return callback(null, { authors: author })
        } catch (error) {
            return callback(error, null)
        }
    }
}

function DeleteAuthor(database) {
    return (call, callback) => {
        try {
            const { authorId } = call.request

            assertAuthor(database, authorId)
            database.deleteAuthor(authorId)
            database.save()

            return callback(null, {})
        } catch (error) {
            return callback(error, null)
        }
    }
}

function ListAuthor(database) {
    return (_, callback) => 
        callback(null, { authors: database.listAuthors() })
}

function CreateAuthor(database) {
    return (call, callback) => {
        try {
            const { author } = call.request
            const newAuthor = database.addAuthor(author)
            database.save()

            return callback(null, { authors: newAuthor })
        } catch (error) {
            return callback(error, null)
        }
    }
}

function UpdateAuthor(database) {
    return (call, callback) => {
        try {
            const { authorId, data } = call.request
            assertAuthor(database, authorId)

            const updatedAuthor = database.updateAuthor(authorId, data)
            database.save()

            return callback(null, updatedAuthor)
        } catch (error) {
            return callback(error, null)
        }
    }
}

function assertAuthor(database, id) {
    const author = database.getAuthor(id)
    if(!author) throw new Error(`Author ${id} not found`)
    return author
}

module.exports = (databaseInstance) => ({
    GetAuthor: GetAuthor(databaseInstance),
    UpdateAuthor: UpdateAuthor(databaseInstance),
    DeleteAuthor: DeleteAuthor(databaseInstance),
    ListAuthor: ListAuthor(databaseInstance),
    CreateAuthor: CreateAuthor(databaseInstance)
}) 