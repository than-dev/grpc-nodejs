import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { DB } from '../db';

type InjectableFunction<In, Out> = (
	call: ServerUnaryCall<In, Out>,
	callback: sendUnaryData<Out>,
	database: DB
) => any;

export function inject<In, Out>(fn: InjectableFunction<In, Out>, database: DB) {
	return (call: ServerUnaryCall<In, Out>, callback: sendUnaryData<Out>) =>
		fn(call, callback, database);
}
