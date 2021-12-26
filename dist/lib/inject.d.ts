import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { DB } from '../db';
declare type InjectableFunction<In, Out> = (call: ServerUnaryCall<In, Out>, callback: sendUnaryData<Out>, database: DB) => any;
export declare function inject<In, Out>(fn: InjectableFunction<In, Out>, database: DB): (call: ServerUnaryCall<In, Out>, callback: sendUnaryData<Out>) => any;
export {};
