# Traceable

- [Overview](#overview)
- [Usage](#usage)
- [Type Definitions](#type-definitions)
- [API Reference](#api-reference)

## Overview

In essence, all business processes involve deriving new data from existing lead data, processing and integrating these data points to generate results, and ultimately saving those results.

**Traceable** inherits the idea of **sequential evaluation** from functional programming and expresses this process in a more concise form.

## Usage

### Installation

```bash
npm i -S @mingjue8888/traceable
```

### Import

```typescript
import {Clue, Traceable} from "@mingjue8888/traceable";
```

### Example

Suppose we have these functions and data:

```typescript
declare function findUser(userId: string): Promise<User>;
declare function findPosts(userId: string): Promise<Post[]>;
declare function findFollowUsers(userId: string): Promise<User[]>;
declare function storeUser(user: User): Promise<void>;
declare function handleError(error: Error): Promise<void>;

const userId = "<UUID>";
```

So, we can trace the another data from exists data:

```typescript
Traceable(Promise.resolve({ userId }))       // Traceable({ userId })
    .add("user", x => findUser(x.userId))    // Traceable({ userId, user })
    .add("posts", x => findPosts(x.user.id)) // Traceable({ userId, user, posts })
    .guard(x => x.posts.length > 0, x => new Error(`User:${x.userId} has no posts`))
    .merge(x => ({
        user: {
            id: x.user.id,
            name: x.user.name,
            posts: x.posts,
        }
    })) // Traceable({ user })
    .add("follows", x => findFollowUsers(x.user.id)) // Traceable({ user, follows })
    .merge(x => ({
        user: {
            ...x.user,
            follows: x.follows,
        }
    })) // Traceable({ user })
    .trace()
    .then(({ user }) => storeUser(user))
    .catch(err => handleError(err));
```

## Type Definitions

### Traceable

Traceable is the core of this toolkit; it requires a promise that resolves to a result object.

```typescript
interface Traceable<T extends object> {
    add: <K extends string, E>(key: K, findClue: (x: T) => E | Promise<E>) => Traceable<T & Record<K, E>>;
    guard: (f: (x: T) => boolean, orError: (x: T) => Error) => Traceable<T>;
    merge: <E extends object>(f: (x: T) => E) => Traceable<E>;
    trace: () => Promise<T>;
}
```

### Clue

Clue simplifies parameter passing for Traceable by allowing object to be passed directly.

```typescript
type Clue = <T extends object>(x: T) => Traceable<T>;
```

## API Reference

### add

Extract further data based on existing data, and consolidate all the data into a single object.

#### Signature

```typescript
declare function add<K extends string, T extends object, E>(key: K, findClue: (x: T) => E | Promise<E>): Traceable<T & Record<K, E>>;
```

### guard

If it is determined that the existing data no longer requires further tracking, a "guard" can be used to terminate the tracking process, while also providing the reason for this exception.

#### Signature

```typescript
declare function guard<T extends object>(f: (x: T) => boolean, orError: (x: T) => Error): Traceable<T>;
```

### merge

Use the "merge" that map existing data.

#### Signature

```typescript
declare function merge<T extends object, E extends object>(f: (x: T) => E): Traceable<E>;
```

### trace

Use the "trace" that you can get the result object of Promise.

#### Signature

```typescript
declare function trace<T>(): Promise<T>;
```