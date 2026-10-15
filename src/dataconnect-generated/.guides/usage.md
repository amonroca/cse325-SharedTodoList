# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { registerUser, createTodoList, getTodoLists, getCurrentUser, getMyLists } from '@dataconnect/generated';


// Operation RegisterUser: 
const { data } = await RegisterUser(dataConnect);

// Operation CreateTodoList:  For variables, look at type CreateTodoListVars in ../index.d.ts
const { data } = await CreateTodoList(dataConnect, createTodoListVars);

// Operation GetTodoLists: 
const { data } = await GetTodoLists(dataConnect);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation GetMyLists: 
const { data } = await GetMyLists(dataConnect);


```