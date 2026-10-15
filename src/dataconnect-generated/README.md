# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetTodoLists*](#gettodolists)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*GetMyLists*](#getmylists)
- [**Mutations**](#mutations)
  - [*RegisterUser*](#registeruser)
  - [*CreateTodoList*](#createtodolist)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetTodoLists
You can execute the `GetTodoLists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getTodoLists(options?: ExecuteQueryOptions): QueryPromise<GetTodoListsData, undefined>;

interface GetTodoListsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetTodoListsData, undefined>;
}
export const getTodoListsRef: GetTodoListsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTodoLists(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetTodoListsData, undefined>;

interface GetTodoListsRef {
  ...
  (dc: DataConnect): QueryRef<GetTodoListsData, undefined>;
}
export const getTodoListsRef: GetTodoListsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTodoListsRef:
```typescript
const name = getTodoListsRef.operationName;
console.log(name);
```

### Variables
The `GetTodoLists` query has no variables.
### Return Type
Recall that executing the `GetTodoLists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTodoListsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTodoListsData {
  todoLists: ({
    id: UUIDString;
    title: string;
    description?: string | null;
  } & TodoList_Key)[];
}
```
### Using `GetTodoLists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTodoLists } from '@dataconnect/generated';


// Call the `getTodoLists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTodoLists();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTodoLists(dataConnect);

console.log(data.todoLists);

// Or, you can use the `Promise` API.
getTodoLists().then((response) => {
  const data = response.data;
  console.log(data.todoLists);
});
```

### Using `GetTodoLists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTodoListsRef } from '@dataconnect/generated';


// Call the `getTodoListsRef()` function to get a reference to the query.
const ref = getTodoListsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTodoListsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.todoLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.todoLists);
});
```

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  users: ({
    id: UUIDString;
    uid: string;
    email: string;
    displayName: string;
  } & User_Key)[];
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetMyLists
You can execute the `GetMyLists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyLists(options?: ExecuteQueryOptions): QueryPromise<GetMyListsData, undefined>;

interface GetMyListsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyListsData, undefined>;
}
export const getMyListsRef: GetMyListsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyLists(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyListsData, undefined>;

interface GetMyListsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyListsData, undefined>;
}
export const getMyListsRef: GetMyListsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyListsRef:
```typescript
const name = getMyListsRef.operationName;
console.log(name);
```

### Variables
The `GetMyLists` query has no variables.
### Return Type
Recall that executing the `GetMyLists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyListsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyListsData {
  todoLists: ({
    id: UUIDString;
    title: string;
    description?: string | null;
  } & TodoList_Key)[];
}
```
### Using `GetMyLists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyLists } from '@dataconnect/generated';


// Call the `getMyLists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyLists();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyLists(dataConnect);

console.log(data.todoLists);

// Or, you can use the `Promise` API.
getMyLists().then((response) => {
  const data = response.data;
  console.log(data.todoLists);
});
```

### Using `GetMyLists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyListsRef } from '@dataconnect/generated';


// Call the `getMyListsRef()` function to get a reference to the query.
const ref = getMyListsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyListsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.todoLists);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.todoLists);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## RegisterUser
You can execute the `RegisterUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
registerUser(): MutationPromise<RegisterUserData, undefined>;

interface RegisterUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<RegisterUserData, undefined>;
}
export const registerUserRef: RegisterUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
registerUser(dc: DataConnect): MutationPromise<RegisterUserData, undefined>;

interface RegisterUserRef {
  ...
  (dc: DataConnect): MutationRef<RegisterUserData, undefined>;
}
export const registerUserRef: RegisterUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the registerUserRef:
```typescript
const name = registerUserRef.operationName;
console.log(name);
```

### Variables
The `RegisterUser` mutation has no variables.
### Return Type
Recall that executing the `RegisterUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RegisterUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RegisterUserData {
  user_insert: User_Key;
}
```
### Using `RegisterUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, registerUser } from '@dataconnect/generated';


// Call the `registerUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await registerUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await registerUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
registerUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `RegisterUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, registerUserRef } from '@dataconnect/generated';


// Call the `registerUserRef()` function to get a reference to the mutation.
const ref = registerUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = registerUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateTodoList
You can execute the `CreateTodoList` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTodoList(vars: CreateTodoListVariables): MutationPromise<CreateTodoListData, CreateTodoListVariables>;

interface CreateTodoListRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTodoListVariables): MutationRef<CreateTodoListData, CreateTodoListVariables>;
}
export const createTodoListRef: CreateTodoListRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTodoList(dc: DataConnect, vars: CreateTodoListVariables): MutationPromise<CreateTodoListData, CreateTodoListVariables>;

interface CreateTodoListRef {
  ...
  (dc: DataConnect, vars: CreateTodoListVariables): MutationRef<CreateTodoListData, CreateTodoListVariables>;
}
export const createTodoListRef: CreateTodoListRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTodoListRef:
```typescript
const name = createTodoListRef.operationName;
console.log(name);
```

### Variables
The `CreateTodoList` mutation requires an argument of type `CreateTodoListVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTodoListVariables {
  title: string;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateTodoList` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTodoListData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTodoListData {
  todoList_insert: TodoList_Key;
}
```
### Using `CreateTodoList`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTodoList, CreateTodoListVariables } from '@dataconnect/generated';

// The `CreateTodoList` mutation requires an argument of type `CreateTodoListVariables`:
const createTodoListVars: CreateTodoListVariables = {
  title: ..., 
  description: ..., // optional
};

// Call the `createTodoList()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTodoList(createTodoListVars);
// Variables can be defined inline as well.
const { data } = await createTodoList({ title: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTodoList(dataConnect, createTodoListVars);

console.log(data.todoList_insert);

// Or, you can use the `Promise` API.
createTodoList(createTodoListVars).then((response) => {
  const data = response.data;
  console.log(data.todoList_insert);
});
```

### Using `CreateTodoList`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTodoListRef, CreateTodoListVariables } from '@dataconnect/generated';

// The `CreateTodoList` mutation requires an argument of type `CreateTodoListVariables`:
const createTodoListVars: CreateTodoListVariables = {
  title: ..., 
  description: ..., // optional
};

// Call the `createTodoListRef()` function to get a reference to the mutation.
const ref = createTodoListRef(createTodoListVars);
// Variables can be defined inline as well.
const ref = createTodoListRef({ title: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTodoListRef(dataConnect, createTodoListVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.todoList_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.todoList_insert);
});
```

