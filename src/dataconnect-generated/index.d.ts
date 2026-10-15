import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateTodoListData {
  todoList_insert: TodoList_Key;
}

export interface CreateTodoListVariables {
  title: string;
  description?: string | null;
}

export interface GetCurrentUserData {
  users: ({
    id: UUIDString;
    uid: string;
    email: string;
    displayName: string;
  } & User_Key)[];
}

export interface GetMyListsData {
  todoLists: ({
    id: UUIDString;
    title: string;
    description?: string | null;
  } & TodoList_Key)[];
}

export interface GetTodoListsData {
  todoLists: ({
    id: UUIDString;
    title: string;
    description?: string | null;
  } & TodoList_Key)[];
}

export interface ListMember_Key {
  userId: UUIDString;
  listId: UUIDString;
  __typename?: 'ListMember_Key';
}

export interface RegisterUserData {
  user_insert: User_Key;
}

export interface TodoItem_Key {
  id: UUIDString;
  __typename?: 'TodoItem_Key';
}

export interface TodoList_Key {
  id: UUIDString;
  __typename?: 'TodoList_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface RegisterUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<RegisterUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<RegisterUserData, undefined>;
  operationName: string;
}
export const registerUserRef: RegisterUserRef;

export function registerUser(): MutationPromise<RegisterUserData, undefined>;
export function registerUser(dc: DataConnect): MutationPromise<RegisterUserData, undefined>;

interface CreateTodoListRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTodoListVariables): MutationRef<CreateTodoListData, CreateTodoListVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTodoListVariables): MutationRef<CreateTodoListData, CreateTodoListVariables>;
  operationName: string;
}
export const createTodoListRef: CreateTodoListRef;

export function createTodoList(vars: CreateTodoListVariables): MutationPromise<CreateTodoListData, CreateTodoListVariables>;
export function createTodoList(dc: DataConnect, vars: CreateTodoListVariables): MutationPromise<CreateTodoListData, CreateTodoListVariables>;

interface GetTodoListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetTodoListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetTodoListsData, undefined>;
  operationName: string;
}
export const getTodoListsRef: GetTodoListsRef;

export function getTodoLists(options?: ExecuteQueryOptions): QueryPromise<GetTodoListsData, undefined>;
export function getTodoLists(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetTodoListsData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetMyListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyListsData, undefined>;
  operationName: string;
}
export const getMyListsRef: GetMyListsRef;

export function getMyLists(options?: ExecuteQueryOptions): QueryPromise<GetMyListsData, undefined>;
export function getMyLists(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyListsData, undefined>;

