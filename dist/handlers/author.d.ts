import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { CreateAuthorRequest, CreateAuthorResponse, DeleteAuthorRequest, GetAuthorRequest, GetAuthorResponse, ListAuthorResponse, UpdateAuthorRequest, UpdateAuthorResponse } from '../../../proto/bookstore_pb';
import { DB } from '../db';
export declare function getImplementation(databaseInstance: DB): {
    getAuthor: (call: ServerUnaryCall<GetAuthorRequest, GetAuthorResponse>, callback: sendUnaryData<GetAuthorResponse>) => any;
    updateAuthor: (call: ServerUnaryCall<UpdateAuthorRequest, UpdateAuthorResponse>, callback: sendUnaryData<UpdateAuthorResponse>) => any;
    deleteAuthor: (call: ServerUnaryCall<DeleteAuthorRequest, Empty>, callback: sendUnaryData<Empty>) => any;
    listAuthor: (call: ServerUnaryCall<Empty, ListAuthorResponse>, callback: sendUnaryData<ListAuthorResponse>) => any;
    createAuthor: (call: ServerUnaryCall<CreateAuthorRequest, CreateAuthorResponse>, callback: sendUnaryData<CreateAuthorResponse>) => any;
};
