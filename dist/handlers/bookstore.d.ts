import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { CreateBookRequest, CreateBookResponse, DeleteBookRequest, GetBookRequest, GetBookResponse, ListBookResponse, UpdateBookRequest, UpdateBookResponse } from '../../../proto/bookstore_pb';
import { DB } from '../db';
export declare function getImplementation(databaseInstance: DB): {
    getBook: (call: ServerUnaryCall<GetBookRequest, GetBookResponse>, callback: sendUnaryData<GetBookResponse>) => any;
    updateBook: (call: ServerUnaryCall<UpdateBookRequest, UpdateBookResponse>, callback: sendUnaryData<UpdateBookResponse>) => any;
    deleteBook: (call: ServerUnaryCall<DeleteBookRequest, Empty>, callback: sendUnaryData<Empty>) => any;
    listBook: (call: ServerUnaryCall<Empty, ListBookResponse>, callback: sendUnaryData<ListBookResponse>) => any;
    createBook: (call: ServerUnaryCall<CreateBookRequest, CreateBookResponse>, callback: sendUnaryData<CreateBookResponse>) => any;
};
