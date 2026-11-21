
export interface Traceable<T extends object> {
    add: <K extends string, E extends object>(key: K, findClue: (x: T) => Promise<E>) => Traceable<T & Record<K, E>>;
    guard: (f: (x: T) => boolean, orError: (x: T) => Error) => Traceable<T>;
    merge: <E extends object>(f: (x: T) => E) => Traceable<E>;
    trace: () => Promise<T>;
}

export const Traceable = <T extends object>(p: Promise<T>): Traceable<T> => ({
    add: <K extends string, E extends object>(key: K, findClue: (x: T) => Promise<E>) =>
        Traceable(p.then(x => findClue(x).then(y => ({ ...x, [key]: y }) as T & Record<K, E>))),

    guard: (f: (x: T) => boolean, orError: (x: T) => Error) =>
        Traceable(p.then(x => f(x) ? p : Promise.reject(orError(x)))),

    merge: <E extends object>(f: (x: T) => E) =>
        Traceable(p.then(x => f(x))),

    trace: () => p,
});

export const Clue = <T extends object>(x: T) =>
    Traceable(Promise.resolve(x));
