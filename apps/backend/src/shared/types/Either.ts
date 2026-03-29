export type Left<E> = { success: false; error: E }
export type Right<T> = { success: true; data: T }
export type Either<E, T> = Left<E> | Right<T>

export const left = <E>(error: E): Left<E> => ({ success: false, error })
export const right = <T>(data: T): Right<T> => ({ success: true, data })

export const isLeft = <E, T>(either: Either<E, T>): either is Left<E> => !either.success
export const isRight = <E, T>(either: Either<E, T>): either is Right<T> => either.success
